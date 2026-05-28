package com.evacsense.auth

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.Header

/**
 * Interface defining endpoints for EvacSense Authentication and Presence systems.
 */
interface AuthService {

    @POST("api/auth/login")
    fun login(@Body request: LoginRequest): Call<AuthResponse>

    @POST("api/auth/google-sso")
    fun googleSSO(@Body request: GoogleSSORequest): Call<AuthResponse>

    @POST("api/auth/recovery")
    fun recoverAccount(@Body request: RecoveryRequest): Call<AuthResponse>

    @GET("api/auth/validate-token")
    fun validateToken(@Header("Authorization") bearerToken: String): Call<AuthResponse>

    // Module 2: Classroom Presence Recording endpoints
    @POST("api/presence/scan")
    fun scanPresence(
        @Header("Authorization") bearerToken: String,
        @Body request: ScanPresenceRequest
    ): Call<PresenceResponse>

    @POST("api/presence/manual")
    fun submitManualOverride(
        @Header("Authorization") bearerToken: String,
        @Body request: ManualOverrideRequest
    ): Call<PresenceResponse>
}

// Request Data Clump DTOs
data class LoginRequest(
    val email: String,
    val password: String
)

data class GoogleSSORequest(
    val email: String,
    val name: String,
    val googleToken: String
)

data class RecoveryRequest(
    val email: String
)

// Module 2 Request & Response DTOs
data class ScanPresenceRequest(
    val scans: List<WifiScan>
)

data class WifiScan(
    val macAddress: String,
    val rssi: Int
)

data class ManualOverrideRequest(
    val roomId: String
)

data class PresenceResponse(
    val status: String,
    val action: String?,
    val location: LocationDetails?,
    val message: String?,
    val errors: List<String>?
)

data class LocationDetails(
    val roomId: String?,
    val name: String?,
    val floor: Int?,
    val building: String?,
    val status: String
)
