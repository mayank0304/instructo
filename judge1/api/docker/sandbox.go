package docker

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
)

// DockerSandbox provides functionality for running code in a Docker sandbox
type DockerSandbox struct {
	client       *client.Client
	useLocalExec bool // If true, use local commands instead of Docker (for testing)
}

// NewDockerSandbox creates a new instance of DockerSandbox
// If useLocalExec is true, it will execute code using local commands (less secure, for testing only)
func NewDockerSandbox() (*DockerSandbox, error) {
	// Attempt to create Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv)

	// If Docker client creation fails or the SKIP_DOCKER env var is set, use local execution
	skipDocker := os.Getenv("SKIP_DOCKER") == "true"
	if err != nil || skipDocker {
		if err != nil {
			fmt.Printf("Warning: Failed to create Docker client: %v\n", err)
			fmt.Println("Falling back to local execution (NOT SECURE FOR PRODUCTION)")
		} else if skipDocker {
			fmt.Println("SKIP_DOCKER environment variable set, using local execution (NOT SECURE FOR PRODUCTION)")
		}
		return &DockerSandbox{
			client:       nil,
			useLocalExec: true,
		}, nil
	}

	return &DockerSandbox{
		client:       cli,
		useLocalExec: false,
	}, nil
}

// RunCode executes the provided code in a Docker container based on the specified language
// If useLocalExec is true, it will use local commands instead (less secure, for testing only)
func (d *DockerSandbox) RunCode(language, code string) (string, error) {
	// Create temporary directory to store code files
	tmpDir, err := os.MkdirTemp("", "code-execution")
	if err != nil {
		return "", fmt.Errorf("failed to create temp directory: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Prepare code file based on language
	var (
		codeFilePath string
		imageName    string
		cmdArgs      []string
	)

	switch language {
	case "python":
		codeFilePath = filepath.Join(tmpDir, "code.py")
		imageName = "python:3.9-slim"
		cmdArgs = []string{"python", codeFilePath}
	case "javascript":
		codeFilePath = filepath.Join(tmpDir, "code.js")
		imageName = "node:16-alpine"
		cmdArgs = []string{"node", codeFilePath}
	case "java":
		codeFilePath = filepath.Join(tmpDir, "Main.java")
		imageName = "openjdk:11-slim"
		cmdArgs = []string{"sh", "-c", fmt.Sprintf("cd %s && javac Main.java && java Main", tmpDir)}
	case "cpp":
		codeFilePath = filepath.Join(tmpDir, "code.cpp")
		imageName = "gcc:latest"
		cmdArgs = []string{"sh", "-c", fmt.Sprintf("cd %s && g++ -o program code.cpp && ./program", tmpDir)}
	case "c":
		codeFilePath = filepath.Join(tmpDir, "code.c")
		imageName = "gcc:latest"
		cmdArgs = []string{"sh", "-c", fmt.Sprintf("cd %s && gcc -o program code.c && ./program", tmpDir)}
	default:
		return "", fmt.Errorf("unsupported language: %s", language)
	}

	// Write code to file
	if err := os.WriteFile(codeFilePath, []byte(code), 0644); err != nil {
		return "", fmt.Errorf("failed to write code to file: %v", err)
	}

	// Use local execution if Docker is not available or skipped
	if d.useLocalExec {
		return d.executeLocally(cmdArgs)
	}

	// Docker-based execution
	return d.executeWithDocker(language, code, tmpDir, imageName, cmdArgs)
}

// executeLocally runs the code using local commands (INSECURE, for testing only)
func (d *DockerSandbox) executeLocally(cmdArgs []string) (string, error) {
	fmt.Printf("Executing locally: %v\n", cmdArgs)

	cmd := exec.Command(cmdArgs[0], cmdArgs[1:]...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return string(output), fmt.Errorf("execution error: %v", err)
	}

	return string(output), nil
}

// executeWithDocker runs the code in a Docker container
func (d *DockerSandbox) executeWithDocker(language, code, tmpDir, imageName string, cmdArgs []string) (string, error) {
	ctx := context.Background()

	// Memory limit in bytes: 100MB
	memoryLimit := int64(100 * 1024 * 1024)
	// Disable OOM killer
	oomDisable := false

	// Create container
	resp, err := d.client.ContainerCreate(
		ctx,
		&container.Config{
			Image: imageName,
			Cmd:   cmdArgs,
			Tty:   false,
		},
		&container.HostConfig{
			Binds:       []string{tmpDir + ":/code"},
			NetworkMode: "none", // Disable network access
			Resources: container.Resources{
				Memory:         memoryLimit,
				CPUPeriod:      100000,
				CPUQuota:       50000, // Limit to 50% of CPU
				PidsLimit:      &[]int64{100}[0],
				OomKillDisable: &oomDisable,
			},
		},
		nil,
		nil,
		"",
	)
	if err != nil {
		return "", fmt.Errorf("failed to create container: %v", err)
	}

	// Start container
	if err := d.client.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		return "", fmt.Errorf("failed to start container: %v", err)
	}

	// Setup cleanup
	defer func() {
		// Remove container
		d.client.ContainerRemove(ctx, resp.ID, container.RemoveOptions{
			Force: true,
		})
	}()

	// Wait for container to finish execution
	statusCh, errCh := d.client.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			return "", fmt.Errorf("container wait error: %v", err)
		}
	case <-statusCh:
		// Container execution completed
	}

	// Get logs from the container
	out, err := d.client.ContainerLogs(ctx, resp.ID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
	})
	if err != nil {
		return "", fmt.Errorf("failed to get container logs: %v", err)
	}
	defer out.Close()

	// Read the logs
	var outBuf, errBuf string
	stdoutBuf := new(outputBuffer)
	stderrBuf := new(outputBuffer)
	_, err = stdcopy.StdCopy(stdoutBuf, stderrBuf, out)
	if err != nil {
		return "", fmt.Errorf("failed to read logs: %v", err)
	}

	outBuf = stdoutBuf.String()
	errBuf = stderrBuf.String()

	if errBuf != "" {
		return outBuf, fmt.Errorf("%s", errBuf)
	}

	return outBuf, nil
}

// outputBuffer implements io.Writer to capture output
type outputBuffer struct {
	data []byte
}

func (b *outputBuffer) Write(p []byte) (n int, err error) {
	b.data = append(b.data, p...)
	return len(p), nil
}

func (b *outputBuffer) String() string {
	return string(b.data)
}
