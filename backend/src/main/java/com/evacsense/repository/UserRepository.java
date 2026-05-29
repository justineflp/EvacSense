package com.evacsense.repository;

import com.evacsense.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByStatus(String status);
    Optional<User> findByIdOrEmail(String id, String email);
    List<User> findByRoleIn(List<String> roles);
}
