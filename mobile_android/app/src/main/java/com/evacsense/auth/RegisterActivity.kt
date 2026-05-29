package com.evacsense.auth

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class RegisterActivity : AppCompatActivity() {

    private lateinit var roleSpinner: Spinner
    private lateinit var nameInput: EditText
    private lateinit var emailInput: EditText
    private lateinit var idLabel: TextView
    private lateinit var idInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var registerButton: Button
    private lateinit var backToLoginButton: Button
    private lateinit var regProgress: ProgressBar

    private lateinit var authService: AuthService
    private val roles = arrayOf("Student", "Teacher", "Drill Coordinator")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Find elements
        roleSpinner = findViewById(R.id.roleSpinner)
        nameInput = findViewById(R.id.nameInput)
        emailInput = findViewById(R.id.emailInput)
        idLabel = findViewById(R.id.idLabel)
        idInput = findViewById(R.id.idInput)
        passwordInput = findViewById(R.id.passwordInput)
        registerButton = findViewById(R.id.registerButton)
        backToLoginButton = findViewById(R.id.backToLoginButton)
        regProgress = findViewById(R.id.regProgress)

        // Set up Spinner
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, roles)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        roleSpinner.adapter = adapter

        // Setup dynamic inputs based on role selection
        roleSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val selectedRole = roles[position]
                if (selectedRole == "Student") {
                    idLabel.text = "Student ID Number"
                    idInput.hint = "e.g. USR-001"
                    emailInput.hint = "username@student.cit.edu"
                } else {
                    idLabel.text = "Employee ID Number"
                    idInput.hint = "e.g. USR-002"
                    emailInput.hint = "username@cit.edu"
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        // Initialize dynamic API Service
        authService = ApiClient.getService(this)

        registerButton.setOnClickListener { handleRegisterSubmit() }
        backToLoginButton.setOnClickListener { finish() } // Returns to Login screen
    }

    private fun handleRegisterSubmit() {
        val selectedRole = roleSpinner.selectedItem.toString()
        val name = nameInput.text.toString().trim()
        val email = emailInput.text.toString().trim()
        val uniqueId = idInput.text.toString().trim()
        val password = passwordInput.text.toString().trim()

        if (name.isEmpty() || email.isEmpty() || uniqueId.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill out all registration fields.", Toast.LENGTH_LONG).show()
            return
        }

        // Local email validation
        if (selectedRole == "Student") {
            if (!email.endsWith("@student.cit.edu")) {
                Toast.makeText(this, "Students must use student email (@student.cit.edu).", Toast.LENGTH_LONG).show()
                return
            }
        } else {
            if (!email.endsWith("@cit.edu")) {
                Toast.makeText(this, "Staff must use institutional faculty email (@cit.edu).", Toast.LENGTH_LONG).show()
                return
            }
        }

        showLoading(true)

        val deviceId = "DEVICE-" + Math.floor(1000 + Math.random() * 9000).toInt()

        if (selectedRole == "Student") {
            val studentReq = StudentRegisterRequest(name, email, studentId = uniqueId, password, deviceId)
            authService.registerStudent(studentReq).enqueue(object : Callback<AuthResponse> {
                override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                    showLoading(false)
                    val body = response.body()
                    if (response.isSuccessful && body?.status == "success") {
                        Toast.makeText(this@RegisterActivity, "Student registered successfully! Auto-activated.", Toast.LENGTH_LONG).show()
                        finish()
                    } else {
                        val errorMsg = body?.message ?: "Student registration failed."
                        Toast.makeText(this@RegisterActivity, errorMsg, Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                    showLoading(false)
                    Toast.makeText(this@RegisterActivity, "Connection error: Failed to reach server.", Toast.LENGTH_LONG).show()
                }
            })
        } else {
            val staffReq = StaffRegisterRequest(name, email, employeeId = uniqueId, password, deviceId, role = selectedRole)
            authService.registerStaff(staffReq).enqueue(object : Callback<AuthResponse> {
                override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                    showLoading(false)
                    val body = response.body()
                    if (response.isSuccessful && (body?.status == "success" || body?.status == "pending")) {
                        Toast.makeText(this@RegisterActivity, "Staff registration submitted! Pending admin approval.", Toast.LENGTH_LONG).show()
                        finish()
                    } else {
                        val errorMsg = body?.message ?: "Staff registration failed."
                        Toast.makeText(this@RegisterActivity, errorMsg, Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                    showLoading(false)
                    Toast.makeText(this@RegisterActivity, "Connection error: Failed to reach server.", Toast.LENGTH_LONG).show()
                }
            })
        }
    }

    private fun showLoading(isLoading: Boolean) {
        regProgress.visibility = if (isLoading) View.VISIBLE else View.GONE
        registerButton.isEnabled = !isLoading
        backToLoginButton.isEnabled = !isLoading
    }
}


