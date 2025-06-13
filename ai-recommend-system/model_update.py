import os
import torch
import shutil
from improved_recommendation import ImprovedLearningRecommender

def main():
    print("Recommendation System Model Update Tool")
    print("="*60)
    
    model_path = "improved_hotel_recommender_model.pth"
    backup_path = f"{model_path}.backup"
    users_file = 'datas/expanded_users.json'
    hotels_file = 'datas/expanded_hotels.json'
    
    # First try to delete the existing model
    if os.path.exists(model_path):
        try:
            # If backup file exists, try to delete it first
            if os.path.exists(backup_path):
                os.remove(backup_path)
                print(f"Old backup file deleted: {backup_path}")            
            # Now let's backup the current model
            shutil.copy2(model_path, backup_path)
            print(f"Current model backed up: {backup_path}")
            
            # Delete the main model file
            os.remove(model_path)
            print(f"Current model file deleted: {model_path}")
        except Exception as e:
            print(f"Error during file operations: {e}")
    else:
        print("Current model file not found. A new model will be trained.")
    
    # Train new model
    print("\nTraining new model...")
    try:
        # ImprovedLearningRecommender object is created without model_path
        # so no model loading is attempted
        recommender = ImprovedLearningRecommender(users_file, hotels_file)
        
        # Train the model
        recommender.train(evaluate=True)
        
        print("\nModel training completed.")
        print(f"New model saved as {model_path}.")
        
        # Generate samples
        print("\nGenerating example recommendations...")
        test_user_ids = [1, 2, 3]  # Example users
        
        for user_id in test_user_ids:
            print(f"\n{'='*80}")
            print(f"Recommendations for User ID: {user_id}:")
            
            recommendations = recommender.recommend_hotels(user_id, top_n=3, debug=True)
            
            for i, rec in enumerate(recommendations, 1):
                print(f"\n{i}. {rec['hotel_name']} - {rec['room_name']}")
                print(f"   Predicted Rating: {rec['predicted_rating']}")
                print(f"   Room Type: {rec['room_type']}")
                print(f"   Price: {rec['price']} TL")
                print(f"   Recommendation Explanation: {rec['recommendation_type']}")
                
                # Show detailed explanation for each recommendation
                explanation = recommender.explain_recommendation(user_id, rec['hotel_id'])
                if explanation and "error" not in explanation:
                    print(f"\n   Detailed Explanation: {explanation['explanation']}")
        
        print("\nProcess completed. You can now run the model_evaluation.py script.")
        return True
    except Exception as e:
        print(f"Error occurred during model training: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    main() 