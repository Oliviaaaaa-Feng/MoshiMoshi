//
//  Models.swift
//  MoshiMoshi
//
//  Created by Olivia on 2026/1/23.
//

import Foundation
import SwiftUI


struct ReservationRequest: Codable {
    var restaurantName: String = ""
    var restaurantPhone: String = ""
    
    var customerName: String = ""
    var customerPhone: String = ""
    
    var dateTime: Date = Date()
    var partySize: Int = 2
    var specialRequests: String = ""
}


enum ReservationStatus: String, Codable {
    case pending = "Calling..."
    case confirmed = "Confirmed"
    case failed = "Failed"
    case busy = "Line Busy"
    
    var color: Color {
        switch self {
        case .pending: return .gray
        case .confirmed: return .sushiWasabi // Green
        case .failed, .busy: return .sushiTuna   // Red
        }
    }
    
    var icon: String {
        switch self {
        case .pending: return "phone.connection"
        case .confirmed: return "checkmark.circle.fill"
        case .failed: return "xmark.circle.fill"
        case .busy: return "phone.down.circle.fill"
        }
    }
}

struct ReservationItem: Identifiable {
    let id = UUID()
    let request: ReservationRequest
    var status: ReservationStatus
    var resultMessage: String?
    let timestamp = Date()
}
