package com.instructo.Instructo.repository;

import com.instructo.Instructo.model.UserModel;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<UserModel, ObjectId> {

    UserModel findByusername(String username);

    void deleteByUsername(String username);
}


