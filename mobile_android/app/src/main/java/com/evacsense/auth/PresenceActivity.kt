package com.evacsense.auth

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.LinearLayout
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

class PresenceActivity : AppCompatActivity() {

    private lateinit var scanStatusText: TextView
    private lateinit var triggerScanButton: Button
    private lateinit var resultCard: LinearLayout
    private lateinit var resultTitle: TextView
    private lateinit var roomNameText: TextView
    private lateinit var floorText: TextView
    private lateinit var roomSpinner: Spinner
    private lateinit var submitManualButton: Button
    private lateinit var backToDashboardButton: Button

    private lateinit var authService: AuthService

    private val roomIds = arrayOf("ROOM-401", "ROOM-402", "ROOM-403")
    private val roomNames = arrayOf(
        "Room 401 (CS Lab 1)",
        "Room 402 (CS Lab 2)",
        "Room 403 (CCS Seminar Room)"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_presence)

        // Find elements
        scanStatusText = findViewById(R.id.scanStatusText)
        triggerScanButton = findViewById(R.id.triggerScanButton)
        resultCard = findViewById(R.id.resultCard)
        resultTitle = findViewById(R.id.resultTitle)
        roomNameText = findViewById(R.id.roomNameText)
        floorText = findViewById(R.id.floorText)
        roomSpinner = findViewById(R.id.roomSpinner)
        submitManualButton = findViewById(R.id.submitManualButton)
        backToDashboardButton = findViewById(R.id.backToDashboardButton)

        // Setup Room Spinner Dropdown
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, roomNames)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        roomSpinner.adapter = adapter

        // Setup Retrofit Client
        val retrofit = Retrofit.Builder()
            .baseUrl("http://10.0.2.2:5000/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        authService = retrofit.create(AuthService::class.java)

        triggerScanButton.setOnClickListener { handleAutoRSSIScan() }
        submitManualButton.setOnClickListener { handleManualOverride() }
        backToDashboardButton.setOnClickListener { finish() }
    }

    private fun handleAutoRSSIScan() {
        val sharedPref = getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
        val token = sharedPref.getString("auth_token", null)

        if (token == null) {
            Toast.makeText(this, "Session token missing. Please re-authenticate.", Toast.LENGTH_LONG).show()
            return
        }

        scanStatusText.text = "Configuring multi-AP signal sweeps..."
        triggerScanButton.isEnabled = false

        // Simulate local Wi-Fi Access Point scans
        // Creating mock AP readings near ROOM-401: AP-01 is strong (-55 dBm)
        val mockScans = listOf(
            WifiScan("00:0a:95:9d:68:16", -55), // Strong AP-01 near Room 401
            WifiScan("00:0a:95:9d:68:17", -78), // Weak AP-02
            WifiScan("00:0a:95:9d:68:18", -82)  // Weak AP-03
        )
        val request = ScanPresenceRequest(mockScans)

        // Execute API call
        authService.scanPresence("Bearer $token", request).enqueue(object : Callback<PresenceResponse> {
            override fun onResponse(call: Call<PresenceResponse>, response: Response<PresenceResponse>) {
                triggerScanButton.isEnabled = true
                val body = response.body()

                if (response.isSuccessful && body?.status == "success") {
                    val location = body.location
                    if (location != null && location.status == "verified") {
                        scanStatusText.text = "Localization baseline confirmed!"
                        
                        // Update result UI card
                        resultTitle.text = "AUTO LOCATION VERIFIED"
                        resultTitle.setTextColor(resources.getColor(android.R.color.holo_green_dark, theme))
                        roomNameText.text = location.name ?: "Unknown Classroom"
                        floorText.text = "Floor: ${location.floor} | Building: ${location.building ?: "CIT-U CCS"}"
                        resultCard.visibility = View.VISIBLE
                        Toast.makeText(this@PresenceActivity, "Localization baseline synchronized successfully.", Toast.LENGTH_LONG).show()
                    } else {
                        scanStatusText.text = "Localization unverified."
                        resultCard.visibility = View.GONE
                        Toast.makeText(this@PresenceActivity, "Weak signal boundaries. Try manual fallback override.", Toast.LENGTH_LONG).show()
                    }
                } else {
                    scanStatusText.text = "Auto scanning failed."
                    Toast.makeText(this@PresenceActivity, body?.message ?: "Scan failed.", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<PresenceResponse>, t: Throwable) {
                triggerScanButton.isEnabled = true
                scanStatusText.text = "Connection failure."
                Toast.makeText(this@PresenceActivity, "Failed to connect to EvacSense presence baseline API.", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun handleManualOverride() {
        val sharedPref = getSharedPreferences("evacsense_prefs", Context.MODE_PRIVATE)
        val token = sharedPref.getString("auth_token", null)

        if (token == null) {
            Toast.makeText(this, "Session token missing.", Toast.LENGTH_LONG).show()
            return
        }

        val selectedIndex = roomSpinner.selectedItemPosition
        val selectedRoomId = roomIds[selectedIndex]

        submitManualButton.isEnabled = false

        authService.submitManualOverride("Bearer $token", ManualOverrideRequest(selectedRoomId)).enqueue(object : Callback<PresenceResponse> {
            override fun onResponse(call: Call<PresenceResponse>, response: Response<PresenceResponse>) {
                submitManualButton.isEnabled = true
                val body = response.body()

                if (response.isSuccessful && body?.status == "success") {
                    val location = body.location
                    if (location != null) {
                        scanStatusText.text = "Manual baseline synchronized!"
                        
                        resultTitle.text = "MANUAL OVERRIDE CONFIRMED"
                        resultTitle.setTextColor(resources.getColor(android.R.color.holo_orange_dark, theme))
                        roomNameText.text = location.name ?: "Manual Room Entry"
                        floorText.text = "Floor: ${location.floor} | Building: College of Computer Studies"
                        resultCard.visibility = View.VISIBLE
                        Toast.makeText(this@PresenceActivity, "Manual override registered successfully.", Toast.LENGTH_LONG).show()
                    }
                } else {
                    Toast.makeText(this@PresenceActivity, body?.message ?: "Override failed.", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<PresenceResponse>, t: Throwable) {
                submitManualButton.isEnabled = true
                Toast.makeText(this@PresenceActivity, "Override submission failed.", Toast.LENGTH_LONG).show()
            }
        })
    }
}
