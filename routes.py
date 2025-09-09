import os
import json
from datetime import datetime, date
from flask import render_template, request, redirect, url_for, flash, session, jsonify, abort
from werkzeug.utils import secure_filename
from user_agents import parse
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

def allowed_video_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'}

def is_mobile_device():
    """Check if the request is from a mobile device"""
    user_agent_string = request.headers.get('User-Agent', '')
    user_agent = parse(user_agent_string)
    return user_agent.is_mobile or user_agent.is_tablet

# Public routes
@app.route('/')
def index():
    # 동영상이 있는 차량을 우선 표시
    cars_with_video = Car.query.filter(Car.video.isnot(None)).order_by(Car.created_at.desc()).all()
    cars_without_video = Car.query.filter(Car.video.is_(None)).order_by(Car.created_at.desc()).all()
    cars = cars_with_video + cars_without_video
    is_mobile = is_mobile_device()
    return render_template('index.html', cars=cars, is_mobile=is_mobile)

@app.route('/cars')
def cars():
    # 동영상이 있는 차량을 우선 표시
    cars_with_video = Car.query.filter(Car.video.isnot(None)).order_by(Car.created_at.desc()).all()
    cars_without_video = Car.query.filter(Car.video.is_(None)).order_by(Car.created_at.desc()).all()
    cars_list = cars_with_video + cars_without_video
    is_mobile = is_mobile_device()
    return render_template('cars.html', cars=cars_list, is_mobile=is_mobile)

@app.route('/car/<int:car_id>')
def car_detail(car_id):
    car = Car.query.get_or_404(car_id)
    is_mobile = is_mobile_device()
    return render_template('car_detail.html', car=car, is_mobile=is_mobile)

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

    # Handle removed images
    removed_images_str = request.form.get('removed_images', '')
    removed_images = removed_images_str.split(',') if removed_images_str else []

    # Remove deleted images from existing images list and delete files
    for removed_image in removed_images:
        if removed_image in existing_images:
            existing_images.remove(removed_image)
            # Delete the actual file
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], removed_image)
            if os.path.exists(image_path):
                os.remove(image_path)

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

    # Handle video upload
    video_file = request.files.get('video')
    removed_video = request.form.get('removed_video', '')

    if video_file and video_file.filename and allowed_video_file(video_file.filename):
        # Delete existing video if it exists
        if car.video and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], car.video)):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], car.video))

        filename = secure_filename(video_file.filename)
        # Add timestamp to avoid conflicts
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        video_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        car.video = filename
    elif removed_video:
        # If video is marked for removal
        if car.video and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], car.video)):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], car.video))
        car.video = None
    elif not video_file or not video_file.filename:
        # If no video uploaded, keep existing video
        pass

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

    # Delete associated video file
    if car.video:
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], car.video)
        if os.path.exists(video_path):
            os.remove(video_path)
    
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

@app.route('/admin/api/reservation/<int:reservation_id>')
@admin_required
def api_reservation_detail(reservation_id):
    reservation = Reservation.query.get_or_404(reservation_id)
    return jsonify({
        'id': reservation.id,
        'car_name': reservation.car.name,
        'customer_name': reservation.customer_name,
        'customer_phone': reservation.customer_phone,
        'customer_email': reservation.customer_email,
        'rental_date': reservation.rental_date.strftime('%Y-%m-%d'),
        'return_date': reservation.return_date.strftime('%Y-%m-%d'),
        'rental_time': reservation.rental_time.strftime('%H:%M'),
        'return_time': reservation.return_time.strftime('%H:%M'),
        'kilometers': reservation.kilometers,
        'notes': reservation.notes
    })
