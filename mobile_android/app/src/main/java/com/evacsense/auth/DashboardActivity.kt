package com.evacsense.auth

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class DashboardActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        // Read extras
        val name = intent.getStringExtra("USER_NAME") ?: "User"
        val role = intent.getStringExtra("USER_ROLE") ?: "Student"
        val email = intent.getStringExtra("USER_EMAIL") ?: ""

        // Find views
        val titleText: TextView = findViewById(R.id.titleText)
        val detailsText: TextView = findViewById(R.id.detailsText)
        val actionText: TextView = findViewById(R.id.actionText)
        val logoutButton: Button = findViewById(R.id.logoutButton)
        val presenceButton: Button = findViewById(R.id.presenceButton)

        // Bind data
        titleText.text = "EvacSense Mobile Portal"
        detailsText.text = "Identity: $name\nRole: $role\nEmail: $email"

        // Set role-based instructions
        actionText.text = when(role) {
            "Student" -> "MOBILE PRIVILEGES ACTIVE\nAuthorized for Dijkstra pathfinding routing and assembly facial recognition."
            "Teacher" -> "TEACHER PRIVILEGES ACTIVE\nAuthorized for pre-drill occupancy overrides and group check-ins."
            "Drill Coordinator" -> "WEB COORDINATION PRIVILEGES REQUIRED\nPlease access the system via the Web Dashboard for active live monitors."
            "System Admin" -> "FULL ADMINISTRATION PRIVILEGES\nAuthorized for security updates and policy controls."
            else -> "Mobile authentication complete. Standard navigation access allowed."
        }

        presenceButton.setOnClickListener {
            startActivity(Intent(this, PresenceActivity::class.java))
        }

        logoutButton.setOnClickListener {
            // Clear credentials and return to login screen
            val sharedPref = getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
            sharedPref.edit().clear().apply()

            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}
