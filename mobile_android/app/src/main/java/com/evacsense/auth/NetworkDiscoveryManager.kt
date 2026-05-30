package com.evacsense.auth

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.util.Log

class NetworkDiscoveryManager(
    private val context: Context,
    private val onServiceFound: (String) -> Unit,
    private val onServiceLost: () -> Unit
) {
    private var nsdManager: NsdManager? = null
    private var discoveryListener: NsdManager.DiscoveryListener? = null
    private val serviceType = "_http._tcp."

    fun startDiscovery() {
        nsdManager = context.getSystemService(Context.NSD_SERVICE) as NsdManager
        
        discoveryListener = object : NsdManager.DiscoveryListener {
            override fun onDiscoveryStarted(regType: String) {
                Log.d("NSD", "Service discovery started")
            }

            override fun onServiceFound(serviceInfo: NsdServiceInfo) {
                Log.d("NSD", "Service discovery success: $serviceInfo")
                if (serviceInfo.serviceName.contains("EvacSenseBackend")) {
                    nsdManager?.resolveService(serviceInfo, object : NsdManager.ResolveListener {
                        override fun onResolveFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
                            Log.e("NSD", "Resolve failed: $errorCode")
                        }

                        override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
                            Log.d("NSD", "Resolve Succeeded. $serviceInfo")
                            val host = serviceInfo.host
                            val port = serviceInfo.port
                            val ipAddress = host.hostAddress
                            
                            if (ipAddress != null) {
                                val serverUrl = "http://$ipAddress:$port/"
                                onServiceFound(serverUrl)
                            }
                        }
                    })
                }
            }

            override fun onServiceLost(serviceInfo: NsdServiceInfo) {
                Log.e("NSD", "service lost: $serviceInfo")
                if (serviceInfo.serviceName.contains("EvacSenseBackend")) {
                    onServiceLost()
                }
            }

            override fun onDiscoveryStopped(serviceType: String) {
                Log.i("NSD", "Discovery stopped: $serviceType")
            }

            override fun onStartDiscoveryFailed(serviceType: String, errorCode: Int) {
                Log.e("NSD", "Discovery failed: Error code:$errorCode")
                nsdManager?.stopServiceDiscovery(this)
            }

            override fun onStopDiscoveryFailed(serviceType: String, errorCode: Int) {
                Log.e("NSD", "Discovery failed: Error code:$errorCode")
                nsdManager?.stopServiceDiscovery(this)
            }
        }

        nsdManager?.discoverServices(serviceType, NsdManager.PROTOCOL_DNS_SD, discoveryListener)
    }

    fun stopDiscovery() {
        if (discoveryListener != null) {
            try {
                nsdManager?.stopServiceDiscovery(discoveryListener)
            } catch (e: Exception) {
                Log.e("NSD", "Error stopping discovery", e)
            }
            discoveryListener = null
        }
    }
}
