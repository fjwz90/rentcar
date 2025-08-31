from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price_2h = db.Column(db.Integer, nullable=False)  # Price in VND
    price_4h = db.Column(db.Integer, nullable=False)
    price_8h = db.Column(db.Integer, nullable=False)
    images = db.Column(db.Text)  # JSON string of image paths
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_images_list(self):
        if self.images:
            import json
            try:
                return json.loads(self.images)
            except:
                return []
        return []
    
    def set_images_list(self, images_list):
        import json
        self.images = json.dumps(images_list)

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    customer_email = db.Column(db.String(120))
    rental_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=False)
    rental_time = db.Column(db.Time, nullable=False)
    return_time = db.Column(db.Time, nullable=False)
    kilometers = db.Column(db.Integer)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    car = db.relationship('Car', backref=db.backref('reservations', lazy=True))

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
