package com.instructo.Instructo.model;

import java.util.Objects;

public class Language {

    private String language;
    private String level;

    // Default constructor
    public Language() {
    }

    // Constructor with all fields
    public Language(String language, String level) {
        this.language = language;
        this.level = level;
    }

    // Getters and Setters

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    // toString method
    @Override
    public String toString() {
        return "Language{" +
                "language='" + language + '\'' +
                ", level='" + level + '\'' +
                '}';
    }

    // equals and hashCode (based on language and level)

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Language)) return false;
        Language language1 = (Language) o;
        return Objects.equals(language, language1.language) &&
                Objects.equals(level, language1.level);
    }

    @Override
    public int hashCode() {
        return Objects.hash(language, level);
    }
}
