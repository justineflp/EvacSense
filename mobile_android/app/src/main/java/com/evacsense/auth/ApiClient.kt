package com.evacsense.auth

import android.content.Context
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * Singleton helper that manages a dynamic Retrofit instance.
 * Reads the server base URL from SharedPreferences, enabling local IP/URL configuration at runtime.
 */
object ApiClient {
    private var authService: AuthService? = null
    private var currentBaseUrl: String? = null

    fun getService(context: Context): AuthService {
        val sharedPref = context.getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
        val serverUrl = sharedPref.getString("server_url", AuthService.BASE_URL) ?: AuthService.BASE_URL
        
        // Ensure trailing slash for Retrofit baseUrl requirement
        val sanitizedUrl = if (serverUrl.endsWith("/")) serverUrl else "$serverUrl/"

        if (authService == null || currentBaseUrl != sanitizedUrl) {
            currentBaseUrl = sanitizedUrl
            try {
                val retrofit = Retrofit.Builder()
                    .baseUrl(sanitizedUrl)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
                authService = retrofit.create(AuthService::class.java)
            } catch (e: Exception) {
                // Fallback to default BASE_URL in case of an invalid custom URL format
                val retrofit = Retrofit.Builder()
                    .baseUrl(AuthService.BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
                authService = retrofit.create(AuthService::class.java)
                currentBaseUrl = AuthService.BASE_URL
            }
        }
        return authService!!
    }

    /**
     * Resets the cached service instance, forcing recreation on the next API call.
     */
    fun reset() {
        authService = null
        currentBaseUrl = null
    }
}
