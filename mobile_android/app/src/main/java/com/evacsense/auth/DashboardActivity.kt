package com.evacsense.auth

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.wifi.WifiManager
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class DashboardActivity : AppCompatActivity() {

    private val handler = android.os.Handler(android.os.Looper.getMainLooper())
    private var pollRunnable: Runnable? = null
    private lateinit var authService: AuthService
    private var currentDrillId: Int? = null
    private val LOCATION_PERMISSION_REQUEST_CODE = 888

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
        val checkInButton: Button = findViewById(R.id.checkInButton)
        val navigationButton: Button = findViewById(R.id.navigationButton)

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

        // Initialize dynamic API Service
        authService = ApiClient.getService(this)

        // For Student role, automatically activate active drill polling detector
        if (role == "Student") {
            startDrillPolling()
        }

        presenceButton.setOnClickListener {
            startActivity(Intent(this, PresenceActivity::class.java))
        }

        checkInButton.setOnClickListener {
            startActivity(Intent(this, CheckInActivity::class.java))
        }

        navigationButton.setOnClickListener {
            startActivity(Intent(this, NavigationActivity::class.java))
        }

        logoutButton.setOnClickListener {
            // Clear credentials and return to login screen
            val sharedPref = getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
            sharedPref.edit().clear().apply()

            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun startDrillPolling() {
        pollRunnable = object : Runnable {
            override fun run() {
                authService.getActiveDrill().enqueue(object : Callback<ActiveDrillResponse> {
                    override fun onResponse(call: Call<ActiveDrillResponse>, response: Response<ActiveDrillResponse>) {
                        val body = response.body()
                        if (response.isSuccessful && body?.status == "success") {
                            val activeDrill = body.activeDrill
                            if (activeDrill != null) {
                                // Dynamic drill trigger!
                                if (currentDrillId != activeDrill.id) {
                                    currentDrillId = activeDrill.id
                                    triggerEmergencyResponse(activeDrill.name)
                                }
                            } else {
                                currentDrillId = null
                            }
                        }
                        handler.postDelayed(pollRunnable!!, 3000)
                    }

                    override fun onFailure(call: Call<ActiveDrillResponse>, t: Throwable) {
                        handler.postDelayed(pollRunnable!!, 3000)
                    }
                })
            }
        }
        handler.post(pollRunnable!!)
    }

    private fun triggerEmergencyResponse(drillName: String) {
        AlertDialog.Builder(this)
            .setTitle("🚨 ACTIVE EMERGENCY DRILL")
            .setMessage("Active Drill: $drillName\n\nEvacSense is automatically scanning physical Wi-Fi AP signals to locate your current classroom position...")
            .setCancelable(false)
            .setPositiveButton("Locating...") { dialog, _ -> dialog.dismiss() }
            .show()

        startAutoRSSIEnrollment()
    }

    private fun startAutoRSSIEnrollment() {
        val sharedPref = getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
        val token = sharedPref.getString("auth_token", null)
        if (token == null) return

        // Verify Location permissions
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), LOCATION_PERMISSION_REQUEST_CODE)
            return
        }

        performWifiScan(token)
    }

    private fun performWifiScan(token: String) {
        val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        if (!wifiManager.isWifiEnabled) {
            wifiManager.isWifiEnabled = true
        }

        val wifiScanReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                unregisterReceiver(this)
                processWifiScanResults(wifiManager, token)
            }
        }

        registerReceiver(wifiScanReceiver, IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION))
        val success = wifiManager.startScan()
        if (!success) {
            unregisterReceiver(wifiScanReceiver)
            processWifiScanResults(wifiManager, token)
        }
    }

    private fun processWifiScanResults(wifiManager: WifiManager, token: String) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            launchNavigationScreen("ROOM-101")
            return
        }

        val results = wifiManager.scanResults
        val wifiScans = mutableListOf<WifiScan>()
        for (result in results) {
            wifiScans.add(WifiScan(result.BSSID, result.level))
        }

        // Emulator/physical hardware sweep fallback coordination
        if (wifiScans.isEmpty()) {
            wifiScans.add(WifiScan("00:0a:95:9d:68:16", -55)) // Mock AP-01 -> Room 401
            wifiScans.add(WifiScan("00:0a:95:9d:68:17", -78))
            wifiScans.add(WifiScan("00:0a:95:9d:68:18", -82))
        }

        authService.scanPresence("Bearer $token", ScanPresenceRequest(wifiScans)).enqueue(object : Callback<PresenceResponse> {
            override fun onResponse(call: Call<PresenceResponse>, response: Response<PresenceResponse>) {
                val body = response.body()
                if (response.isSuccessful && body?.status == "success" && body.location != null) {
                    val roomId = body.location.roomId ?: "ROOM-101"
                    val roomName = body.location.name ?: "CS Lab 1 (Room 401)"
                    Toast.makeText(this@DashboardActivity, "Auto-localized at $roomName", Toast.LENGTH_LONG).show()
                    launchNavigationScreen(roomId)
                } else {
                    launchNavigationScreen("ROOM-101")
                }
            }

            override fun onFailure(call: Call<PresenceResponse>, t: Throwable) {
                launchNavigationScreen("ROOM-101")
            }
        })
    }

    private fun launchNavigationScreen(roomId: String) {
        val intent = Intent(this, NavigationActivity::class.java).apply {
            putExtra("DETECTED_ROOM_ID", roomId)
        }
        startActivity(intent)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            val sharedPref = getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
            val token = sharedPref.getString("auth_token", null)
            if (token != null && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                performWifiScan(token)
            } else {
                launchNavigationScreen("ROOM-101")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        pollRunnable?.let { handler.removeCallbacks(it) }
    }
}
