//
//  ViewModel.swift
//  MoshiMoshi
//
//  Created by Olivia on 2026/1/23.
//

import SwiftUI

class ReservationViewModel: ObservableObject {
    @Published var request = ReservationRequest()
    @Published var reservations: [ReservationItem] = [] // List of history
    @Published var isSubmitting = false
    @Published var showProfileSheet = false
    
    @AppStorage("savedUserName") var savedUserName: String = ""
    @AppStorage("savedUserPhone") var savedUserPhone: String = ""
    
    init() {
        refreshUserData()
    }
    
    func refreshUserData() {
        if !savedUserName.isEmpty { request.customerName = savedUserName }
        if !savedUserPhone.isEmpty { request.customerPhone = savedUserPhone }
    }
    
    func startAICall() {
        self.isSubmitting = true
        
        // 1. Create a "Pending" ticket immediately
        var newReservation = ReservationItem(request: self.request, status: .pending, resultMessage: "AI Agent is dialing...")
        
        // Add to the top of the list
        withAnimation {
            self.reservations.insert(newReservation, at: 0)
        }
        
        // 2. Clear the form slightly (optional) or just stop the spinner
        self.isSubmitting = false
        
        // 3. Simulate Backend Processing (The 2-minute wait)
        // In real backend, this would be a Push Notification or Polling
        DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) { [weak self] in
            self?.mockBackendResponse(for: newReservation.id)
        }
    }
    
    // Simulating what the Python backend returns
    func mockBackendResponse(for id: UUID) {
        if let index = reservations.firstIndex(where: { $0.id == id }) {
            withAnimation {
                // Randomly succeed or fail for demo purposes
                let isSuccess = Bool.random()
                
                if isSuccess {
                    reservations[index].status = .confirmed
                    reservations[index].resultMessage = "Reserved! Table #4 confirmed by Host."
                } else {
                    reservations[index].status = .busy
                    reservations[index].resultMessage = "Restaurant is not answering. Try again later."
                }
            }
        }
    }
    
    var isValid: Bool {
        return !request.restaurantName.isEmpty &&
               !request.restaurantPhone.isEmpty &&
               !request.customerName.isEmpty &&
               !request.customerPhone.isEmpty
    }
}
