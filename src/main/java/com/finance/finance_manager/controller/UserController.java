package com.finance.finance_manager.controller;

import com.finance.finance_manager.dto.UserDTO;
import com.finance.finance_manager.entity.Role;
import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "2. User Management (UserController)", description = "Endpoints for managing users (Admin only)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Retrieves a list of all registered users. Requires ADMIN role.")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role", description = "Updates the role of a specific user. Requires ADMIN role.")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateUserRole(id, role, currentUser));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Activates or deactivates a user account. Requires ADMIN role.")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateUserStatus(id, active, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Deletes a specific user account. Requires ADMIN role.")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        userService.deleteUser(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
