package com.evacsense.config;

import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import javax.jmdns.JmDNS;
import javax.jmdns.ServiceInfo;
import java.io.IOException;
import java.net.InetAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class MDNSRegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(MDNSRegistrationService.class);
    private JmDNS jmdns;

    @PostConstruct
    public void registerService() {
        try {
            // Find the local IP address
            InetAddress localHost = InetAddress.getLocalHost();
            logger.info("Initializing mDNS on local host: {}", localHost.getHostAddress());

            // Initialize JmDNS
            jmdns = JmDNS.create(localHost);

            // Register service: type _http._tcp.local., name "EvacSenseBackend", port 5000
            ServiceInfo serviceInfo = ServiceInfo.create("_http._tcp.local.", "EvacSenseBackend", 5000, "EvacSense API Server");
            jmdns.registerService(serviceInfo);

            logger.info("Successfully registered mDNS service: EvacSenseBackend on port 5000");

        } catch (IOException e) {
            logger.error("Failed to register mDNS service", e);
        }
    }

    @PreDestroy
    public void unregisterService() {
        if (jmdns != null) {
            jmdns.unregisterAllServices();
            try {
                jmdns.close();
                logger.info("Unregistered mDNS services");
            } catch (IOException e) {
                logger.error("Failed to close JmDNS", e);
            }
        }
    }
}
