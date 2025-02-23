from flask import Blueprint, request, jsonify
from flask_pymongo import PyMongo
from datetime import datetime
from pytz import timezone

transactions_bp = Blueprint('transactions', __name__)
mongo_instance = None

# Define IST timezone
ist = timezone('Asia/Kolkata')

@transactions_bp.route('/api/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'wasteType', 'quantity', 'center']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    # Calculate points based on waste type and quantity
    points = calculate_points(data['wasteType'], data['quantity'])
    
    # Create transaction document
    transaction = {
        'username': data['username'],
        'wasteType': data['wasteType'],
        'quantity': data['quantity'],
        'points': points,
        'center': data['center'],
        'status': 'pending',
        'created_at': datetime.now(ist).astimezone(ist),
        'original_points': points
    }
    
    try:
        # Insert transaction
        result = mongo_instance.db.transactions.insert_one(transaction)
        
        # Update user's total points
        mongo_instance.db.users.update_one(
            {'username': data['username']},
            {'$inc': {'points': points}}
        )
        
        return jsonify({
            'success': True,
            'message': 'Transaction created successfully',
            'transaction_id': str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

def calculate_points(waste_type, quantity):
    # Points calculation logic based on waste type
    points_per_kg = {
        'plastic': 11,
        'electronic': 16,
        'organic': 5,
        'metal': 13,
        'paper': 8,
        'glass': 8
    }
    
    return points_per_kg.get(waste_type.lower(), 0) * float(quantity)

def init_transactions_routes(mongo):
    global mongo_instance
    mongo_instance = mongo