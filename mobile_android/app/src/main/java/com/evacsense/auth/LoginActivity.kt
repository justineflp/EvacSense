package com.evacsense.auth

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class LoginActivity : AppCompatActivity() {

    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var loginButton: Button
    private lateinit var googleSsoButton: Button
    private lateinit var recoveryButton: TextView
    private lateinit var errorText: TextView
    private lateinit var loadingProgress: ProgressBar

    private lateinit var authService: AuthService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Initialize UI Elements
        emailInput = findViewById(R.id.emailInput)
        passwordInput = findViewById(R.id.passwordInput)
        loginButton = findViewById(R.id.loginButton)
        googleSsoButton = findViewById(R.id.googleSsoButton)
        recoveryButton = findViewById(R.id.recoveryButton)
        errorText = findViewById(R.id.errorText)
        loadingProgress = findViewById(R.id.loadingProgress)

        // Initialize Retrofit Client
        // Note: Change BASE_URL inside AuthService to match your server network configurations
        val retrofit = Retrofit.Builder()
            .baseUrl(AuthService.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        authService = retrofit.create(AuthService::class.java)

        // Check if token exists in SharedPreferences for session auto-login
        checkExistingSession()

        // Set Click Listeners
        loginButton.setOnClickListener { handleLogin() }
        googleSsoButton.setOnClickListener { handleGoogleSSO() }
        recoveryButton.setOnClickListener { handleAccountRecovery() }

        // brandTitle click opens the registration screen
        val brandTitle: TextView = findViewById(R.id.brandTitle)
        brandTitle.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun checkExistingSession() {
        val sharedPref = getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
        val token = sharedPref.getString("auth_token", null)
        
        if (token != null) {
            // Fast validate session token
            showLoading(true)
            authService.validateToken("Bearer $token").enqueue(object : Callback<AuthResponse> {
                override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                    showLoading(false)
                    if (response.isSuccessful && response.body()?.status == "success") {
                        val user = response.body()?.user
                        if (user != null) {
                            navigateToDashboard(user)
                        }
                    } else {
                        // Clear invalid local token
                        sharedPref.edit().remove("auth_token").apply()
                    }
                }

                override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                    showLoading(false)
                    // If backend is offline, do not block app but clear loading state
                }
            })
        }
    }

    private fun handleLogin() {
        errorText.visibility = View.GONE
        val email = emailInput.text.toString().trim()
        val password = passwordInput.text.toString().trim()

        // Validation Checks
        if (email.isEmpty() || password.isEmpty()) {
            showError("Please fill out both email and password fields.")
            return
        }

        // Domain Security Filter
        if (!email.endsWith("@cit.edu") && !email.endsWith("@student.cit.edu")) {
            showError("Only institutional accounts (@cit.edu / @student.cit.edu) are accepted.")
            return
        }

        showLoading(true)
        val request = LoginRequest(email, password)

        authService.login(request).enqueue(object : Callback<AuthResponse> {
            override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                showLoading(false)
                val body = response.body()
                
                if (response.isSuccessful && body?.status == "success") {
                    // Persist JWT Token
                    val token = body.session?.token
                    val user = body.user
                    if (token != null && user != null) {
                        saveSession(token, user)
                        navigateToDashboard(user)
                    }
                } else {
                    val errMsg = body?.message ?: "Invalid institutional credentials."
                    showError(errMsg)
                }
            }

            override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                showLoading(false)
                showError("Cannot connect to EvacSense API. Check server connection.")
            }
        })
    }

    private fun handleGoogleSSO() {
        errorText.visibility = View.GONE
        // For simulation purposes, we trigger Google SSO with student account USR-001
        showLoading(true)
        val request = GoogleSSORequest(
            email = "m.santos@student.cit.edu",
            name = "Maria Santos",
            googleToken = "SIMULATED_SSO_GOOGLE_TOKEN_12345"
        )

        authService.googleSSO(request).enqueue(object : Callback<AuthResponse> {
            override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                showLoading(false)
                val body = response.body()
                if (response.isSuccessful && body?.status == "success") {
                    val token = body.session?.token
                    val user = body.user
                    if (token != null && user != null) {
                        saveSession(token, user)
                        navigateToDashboard(user)
                    }
                } else {
                    showError(body?.message ?: "Google SSO assertion failed.")
                }
            }

            override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                showLoading(false)
                showError("Google SSO connection failed.")
            }
        })
    }

    private fun handleAccountRecovery() {
        val email = emailInput.text.toString().trim()
        if (email.isEmpty()) {
            Toast.makeText(this, "Enter your email in the email field first.", Toast.LENGTH_LONG).show()
            return
        }

        if (!email.endsWith("@cit.edu") && !email.endsWith("@student.cit.edu")) {
            Toast.makeText(this, "Only CIT institutional emails can be recovered.", Toast.LENGTH_LONG).show()
            return
        }

        showLoading(true)
        authService.recoverAccount(RecoveryRequest(email)).enqueue(object : Callback<AuthResponse> {
            override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                showLoading(false)
                if (response.isSuccessful && response.body()?.status == "success") {
                    Toast.makeText(this@LoginActivity, "Simulated recovery link sent. Check your inbox.", Toast.LENGTH_LONG).show()
                } else {
                    Toast.makeText(this@LoginActivity, "Email recovery failed. Account not found.", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                showLoading(false)
                Toast.makeText(this@LoginActivity, "Recovery request failed.", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun saveSession(token: String, user: User) {
        val sharedPref = getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
        sharedPref.edit().apply {
            putString("auth_token", token)
            putString("user_id", user.id)
            putString("user_name", user.name)
            putString("user_email", user.email)
            putString("user_role", user.role)
            putString("user_dept", user.department)
            apply()
        }
    }

    private fun navigateToDashboard(user: User) {
        val intent = Intent(this, DashboardActivity::class.java).apply {
            putExtra("USER_NAME", user.name)
            putExtra("USER_ROLE", user.role)
            putExtra("USER_EMAIL", user.email)
        }
        startActivity(intent)
        finish()
    }

    private fun showError(message: String) {
        errorText.text = message
        errorText.visibility = View.VISIBLE
    }

    private fun showLoading(isLoading: Boolean) {
        loadingProgress.visibility = if (isLoading) View.VISIBLE else View.GONE
        loginButton.isEnabled = !isLoading
        googleSsoButton.isEnabled = !isLoading
    }
}
