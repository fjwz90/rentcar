import os
import json
from datetime import datetime, date
from flask import render_template, request, redirect, url_for, flash, session, jsonify, abort
from werkzeug.utils import secure_filename
from app import app, db
from models import Car, Reservation, Admin

# Initialize admin user function
def init_admin():
    admin = Admin.query.filter_by(username='fjwz90').first()
    if not admin:
        admin = Admin(username='fjwz90')
        admin.set_password('Rundev90!')
        db.session.add(admin)
        db.session.commit()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Public routes
@app.route('/')
def index():
    cars = Car.query.all()
    return render_template('index.html', cars=cars)

@app.route('/cars')
def cars():
    cars_list = Car.query.all()
    return render_template('cars.html', cars=cars_list)

@app.route('/car/<int:car_id>')
def car_detail(car_id):
    car = Car.query.get_or_404(car_id)
    return render_template('car_detail.html', car=car)

@app.route('/company')
def company():
    return render_template('company.html')

# Admin routes
@app.route('/fjwz90admin')
def admin_login():
    if 'admin_logged_in' in session:
        return redirect(url_for('admin_dashboard'))
    return render_template('admin/login.html')

@app.route('/admin/login', methods=['POST'])
def admin_login_post():
    username = request.form.get('username')
    password = request.form.get('password')
    
    admin = Admin.query.filter_by(username=username).first()
    
    if admin and admin.check_password(password):
        session['admin_logged_in'] = True
        session['admin_id'] = admin.id
        return redirect(url_for('admin_dashboard'))
    else:
        flash('Invalid credentials', 'error')
        return redirect(url_for('admin_login'))

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_id', None)
    return redirect(url_for('index'))

def admin_required(f):
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/admin')
@admin_required
def admin_dashboard():
    cars_count = Car.query.count()
    reservations_count = Reservation.query.count()
    return render_template('admin/dashboard.html', 
                         cars_count=cars_count, 
                         reservations_count=reservations_count)

@app.route('/admin/cars')
@admin_required
def admin_cars():
    cars_list = Car.query.all()
    return render_template('admin/cars.html', cars=cars_list)

@app.route('/admin/car/add')
@admin_required
def admin_car_add():
    return render_template('admin/car_form.html', car=None)

@app.route('/admin/car/edit/<int:car_id>')
@admin_required
def admin_car_edit(car_id):
    car = Car.query.get_or_404(car_id)
    return render_template('admin/car_form.html', car=car)

@app.route('/admin/car/save', methods=['POST'])
@admin_required
def admin_car_save():
    car_id = request.form.get('car_id')
    name = request.form.get('name')
    description = request.form.get('description')
    price_2h = int(request.form.get('price_2h'))
    price_4h = int(request.form.get('price_4h'))
    price_8h = int(request.form.get('price_8h'))
    
    if car_id:
        car = Car.query.get_or_404(car_id)
    else:
        car = Car()
        db.session.add(car)
    
    car.name = name
    car.description = description
    car.price_2h = price_2h
    car.price_4h = price_4h
    car.price_8h = price_8h
    
    # Handle file uploads
    uploaded_files = request.files.getlist('images')
    existing_images = car.get_images_list() if car_id else []
    new_images = []
    
    for file in uploaded_files:
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid conflicts
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            new_images.append(filename)
    
    # Combine existing and new images
    all_images = existing_images + new_images
    car.set_images_list(all_images)
    
    db.session.commit()
    flash('Car saved successfully!', 'success')
    return redirect(url_for('admin_cars'))

@app.route('/admin/car/delete/<int:car_id>')
@admin_required
def admin_car_delete(car_id):
    car = Car.query.get_or_404(car_id)
    
    # Delete associated image files
    for image in car.get_images_list():
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image)
        if os.path.exists(image_path):
            os.remove(image_path)
    
    db.session.delete(car)
    db.session.commit()
    flash('Car deleted successfully!', 'success')
    return redirect(url_for('admin_cars'))

@app.route('/admin/reservations')
@admin_required
def admin_reservations():
    reservations = Reservation.query.join(Car).all()
    return render_template('admin/reservations.html', reservations=reservations)

@app.route('/admin/reservation/add')
@admin_required
def admin_reservation_add():
    cars_list = Car.query.all()
    return render_template('admin/reservation_form.html', reservation=None, cars=cars_list)

@app.route('/admin/reservation/edit/<int:reservation_id>')
@admin_required
def admin_reservation_edit(reservation_id):
    reservation = Reservation.query.get_or_404(reservation_id)
    cars_list = Car.query.all()
    return render_template('admin/reservation_form.html', reservation=reservation, cars=cars_list)

@app.route('/admin/reservation/save', methods=['POST'])
@admin_required
def admin_reservation_save():
    reservation_id = request.form.get('reservation_id')
    car_id = int(request.form.get('car_id'))
    customer_name = request.form.get('customer_name')
    customer_phone = request.form.get('customer_phone')
    customer_email = request.form.get('customer_email')
    rental_date = datetime.strptime(request.form.get('rental_date'), '%Y-%m-%d').date()
    return_date = datetime.strptime(request.form.get('return_date'), '%Y-%m-%d').date()
    rental_time = datetime.strptime(request.form.get('rental_time'), '%H:%M').time()
    return_time = datetime.strptime(request.form.get('return_time'), '%H:%M').time()
    kilometers = int(request.form.get('kilometers', 0))
    notes = request.form.get('notes')
    
    if reservation_id:
        reservation = Reservation.query.get_or_404(reservation_id)
    else:
        reservation = Reservation()
        db.session.add(reservation)
    
    reservation.car_id = car_id
    reservation.customer_name = customer_name
    reservation.customer_phone = customer_phone
    reservation.customer_email = customer_email
    reservation.rental_date = rental_date
    reservation.return_date = return_date
    reservation.rental_time = rental_time
    reservation.return_time = return_time
    reservation.kilometers = kilometers
    reservation.notes = notes
    
    db.session.commit()
    flash('Reservation saved successfully!', 'success')
    return redirect(url_for('admin_reservations'))

@app.route('/admin/reservation/delete/<int:reservation_id>')
@admin_required
def admin_reservation_delete(reservation_id):
    reservation = Reservation.query.get_or_404(reservation_id)
    db.session.delete(reservation)
    db.session.commit()
    flash('Reservation deleted successfully!', 'success')
    return redirect(url_for('admin_reservations'))

@app.route('/admin/calendar')
@admin_required
def admin_calendar():
    return render_template('admin/calendar.html')

@app.route('/admin/api/reservations')
@admin_required
def api_reservations():
    reservations = Reservation.query.join(Car).all()
    events = []
    
    for reservation in reservations:
        events.append({
            'id': reservation.id,
            'title': f"{reservation.car.name} - {reservation.customer_name}",
            'start': reservation.rental_date.isoformat(),
            'end': reservation.return_date.isoformat(),
            'backgroundColor': '#007bff',
            'borderColor': '#007bff'
        })
    
    return jsonify(events)
