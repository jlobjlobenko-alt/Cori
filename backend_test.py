#!/usr/bin/env python3
"""
Iron Courier Backend API Testing Suite
Tests all backend APIs for the Iron Courier app
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Backend URL from frontend/.env
BACKEND_URL = "https://shift-hustle.preview.emergentagent.com/api"

class IronCourierTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_entries = []  # Track created entries for cleanup
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test GET /api/health endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_result("Health Check", True, "API is healthy", data)
                    return True
                else:
                    self.log_result("Health Check", False, "Invalid health response format", data)
                    return False
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Health Check", False, f"Request failed: {str(e)}")
            return False
    
    def test_leaderboard_get(self):
        """Test GET /api/leaderboard endpoint with sorting"""
        try:
            # Test default sorting
            response = self.session.get(f"{BACKEND_URL}/leaderboard", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Leaderboard GET (default)", True, f"Retrieved {len(data)} entries", {"count": len(data)})
                else:
                    self.log_result("Leaderboard GET (default)", False, "Response is not a list", data)
                    return False
            else:
                self.log_result("Leaderboard GET (default)", False, f"HTTP {response.status_code}", response.text)
                return False
            
            # Test with sorting parameters
            response = self.session.get(f"{BACKEND_URL}/leaderboard?sort_by=longest_streak&limit=50", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Leaderboard GET (sorted)", True, f"Retrieved {len(data)} entries sorted by longest_streak", {"count": len(data), "sort_by": "longest_streak"})
                    return True
                else:
                    self.log_result("Leaderboard GET (sorted)", False, "Response is not a list", data)
                    return False
            else:
                self.log_result("Leaderboard GET (sorted)", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Leaderboard GET", False, f"Request failed: {str(e)}")
            return False
    
    def test_leaderboard_post(self):
        """Test POST /api/leaderboard endpoint"""
        try:
            # Create test entry with realistic data
            test_entry = {
                "display_name": "Alex Rodriguez",
                "longest_streak": 15,
                "total_deliveries": 250,
                "weekly_earnings": 750.50
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/leaderboard",
                json=test_entry,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ["id", "display_name", "longest_streak", "total_deliveries", "weekly_earnings", "monthly_rank", "updated_at"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Leaderboard POST", False, f"Missing fields in response: {missing_fields}", data)
                    return False
                
                # Verify monthly rank calculation
                expected_score = test_entry["total_deliveries"] + (test_entry["longest_streak"] * 10)
                expected_rank = "Bronze Courier"
                if expected_score >= 1000:
                    expected_rank = "Iron Courier"
                elif expected_score >= 500:
                    expected_rank = "Gold Courier"
                elif expected_score >= 200:
                    expected_rank = "Silver Courier"
                
                if data["monthly_rank"] == expected_rank:
                    self.log_result("Leaderboard POST", True, f"Entry created with correct rank: {expected_rank}", {
                        "id": data["id"],
                        "monthly_rank": data["monthly_rank"],
                        "score": expected_score
                    })
                    self.created_entries.append(data["id"])  # Track for cleanup
                    return True
                else:
                    self.log_result("Leaderboard POST", False, f"Incorrect monthly rank. Expected: {expected_rank}, Got: {data['monthly_rank']}", data)
                    return False
                    
            else:
                self.log_result("Leaderboard POST", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Leaderboard POST", False, f"Request failed: {str(e)}")
            return False
    
    def test_leaderboard_put(self):
        """Test PUT /api/leaderboard/{id} endpoint"""
        try:
            # First create an entry to update
            test_entry = {
                "display_name": "Maria Santos",
                "longest_streak": 8,
                "total_deliveries": 120,
                "weekly_earnings": 400.0
            }
            
            create_response = self.session.post(
                f"{BACKEND_URL}/leaderboard",
                json=test_entry,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if create_response.status_code != 200:
                self.log_result("Leaderboard PUT (setup)", False, "Failed to create test entry for PUT test", create_response.text)
                return False
            
            created_entry = create_response.json()
            entry_id = created_entry["id"]
            self.created_entries.append(entry_id)
            
            # Now update the entry
            update_data = {
                "longest_streak": 25,
                "total_deliveries": 500,
                "weekly_earnings": 1200.75
            }
            
            update_response = self.session.put(
                f"{BACKEND_URL}/leaderboard/{entry_id}",
                json=update_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if update_response.status_code == 200:
                updated_data = update_response.json()
                
                # Verify updates were applied
                if (updated_data["longest_streak"] == update_data["longest_streak"] and
                    updated_data["total_deliveries"] == update_data["total_deliveries"] and
                    updated_data["weekly_earnings"] == update_data["weekly_earnings"]):
                    
                    # Verify monthly rank was recalculated
                    expected_score = update_data["total_deliveries"] + (update_data["longest_streak"] * 10)
                    expected_rank = "Bronze Courier"
                    if expected_score >= 1000:
                        expected_rank = "Iron Courier"
                    elif expected_score >= 500:
                        expected_rank = "Gold Courier"
                    elif expected_score >= 200:
                        expected_rank = "Silver Courier"
                    
                    if updated_data["monthly_rank"] == expected_rank:
                        self.log_result("Leaderboard PUT", True, f"Entry updated with recalculated rank: {expected_rank}", {
                            "id": entry_id,
                            "monthly_rank": updated_data["monthly_rank"],
                            "score": expected_score
                        })
                        return True
                    else:
                        self.log_result("Leaderboard PUT", False, f"Monthly rank not recalculated correctly. Expected: {expected_rank}, Got: {updated_data['monthly_rank']}", updated_data)
                        return False
                else:
                    self.log_result("Leaderboard PUT", False, "Update data not applied correctly", {
                        "expected": update_data,
                        "actual": {k: updated_data[k] for k in update_data.keys()}
                    })
                    return False
            else:
                self.log_result("Leaderboard PUT", False, f"HTTP {update_response.status_code}", update_response.text)
                return False
                
        except Exception as e:
            self.log_result("Leaderboard PUT", False, f"Request failed: {str(e)}")
            return False
    
    def test_ai_chat(self):
        """Test POST /api/ai/chat endpoint"""
        try:
            # Test AI chat with context
            chat_message = {
                "message": "Give me motivation to keep working!",
                "context": {
                    "currentStreak": 7,
                    "longestStreak": 15,
                    "totalDeliveries": 180,
                    "totalEarnings": 850.0,
                    "monthlyRank": "Silver Courier",
                    "language": "en"
                }
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/ai/chat",
                json=chat_message,
                headers={"Content-Type": "application/json"},
                timeout=30  # AI requests may take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "response" in data and isinstance(data["response"], str) and len(data["response"]) > 0:
                    self.log_result("AI Chat", True, "AI responded with motivational message", {
                        "response_length": len(data["response"]),
                        "response_preview": data["response"][:100] + "..." if len(data["response"]) > 100 else data["response"]
                    })
                    return True
                else:
                    self.log_result("AI Chat", False, "Invalid AI response format", data)
                    return False
            else:
                self.log_result("AI Chat", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("AI Chat", False, f"Request failed: {str(e)}")
            return False
    
    def cleanup_test_entries(self):
        """Clean up test entries created during testing"""
        print("\n🧹 Cleaning up test entries...")
        for entry_id in self.created_entries:
            try:
                response = self.session.delete(f"{BACKEND_URL}/leaderboard/{entry_id}", timeout=10)
                if response.status_code == 200:
                    print(f"   ✅ Deleted entry {entry_id}")
                else:
                    print(f"   ⚠️  Failed to delete entry {entry_id}: HTTP {response.status_code}")
            except Exception as e:
                print(f"   ⚠️  Failed to delete entry {entry_id}: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Iron Courier Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        tests = [
            ("Health Check", self.test_health_check),
            ("Leaderboard GET", self.test_leaderboard_get),
            ("Leaderboard POST", self.test_leaderboard_post),
            ("Leaderboard PUT", self.test_leaderboard_put),
            ("AI Chat", self.test_ai_chat)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running {test_name}...")
            if test_func():
                passed += 1
        
        # Cleanup
        if self.created_entries:
            self.cleanup_test_entries()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"❌ {total - passed} tests failed")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['message']}")
            return False

def main():
    """Main test runner"""
    tester = IronCourierTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()