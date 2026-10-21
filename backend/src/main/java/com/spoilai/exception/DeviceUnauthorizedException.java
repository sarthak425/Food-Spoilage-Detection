package com.spoilai.exception;

public class DeviceUnauthorizedException extends RuntimeException {
    public DeviceUnauthorizedException(String message) {
        super(message);
    }
}
