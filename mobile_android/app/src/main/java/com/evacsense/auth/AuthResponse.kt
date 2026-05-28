package com.evacsense.auth

import com.google.gson.annotations.SerializedName

/**
 * Data structure representing the standard authentication response payload from the backend.
 */
data class AuthResponse(
    @SerializedName("status") val status: String,
    @SerializedName("action") val action: String?,
    @SerializedName("user") val user: User?,
    @SerializedName("session") val session: SessionDetails?,
    @SerializedName("redirect") val redirect: String?,
    @SerializedName("message") val message: String?,
    @SerializedName("errors") val errors: List<String>?
)

data class SessionDetails(
    @SerializedName("token") val token: String?,
    @SerializedName("expiresIn") val expiresIn: String?,
    @SerializedName("isValid") val isValid: Boolean
)
