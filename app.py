from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_migrate import Migrate
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chore_app.db'
app.config['SECRET_KEY'] = 'secret_key'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)


team_memberships = db.Table('team_memberships',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('team_id', db.Integer, db.ForeignKey('team.id'), primary_key=True)
)

class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, unique=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    owner = db.relationship('User', back_populates='owned_teams')
    members = db.relationship('TeamMembership', back_populates='team')

@app.route('/update_team_name', methods=['POST'])
@login_required
def update_team_name():
    data = request.get_json()
    new_name = data.get('name')

    
    if current_user.owned_teams:
        team = current_user.owned_teams[0]  
        
        if Team.query.filter_by(name=new_name).first():
            return jsonify({'error': 'Team name already exists!'}), 400
        
        team.name = new_name
        db.session.commit()
        return jsonify({'message': 'Team name updated successfully!', 'new_name': team.name})
    else:
        return jsonify({'error': 'You do not own any team to update!'}), 400
        
@app.route('/team_info', methods=['GET'])
@login_required
def team_info():
    
    if current_user.teams:
        team_id = current_user.teams[0].team_id
        team = Team.query.get(team_id)
        if team:
            return jsonify({'team_name': team.name})
    return jsonify({'team_name': None})

@app.route('/team_name', methods=['GET'])
@login_required
def team_name():
    # Fetch the team that the current user is a part of
    team = Team.query.join(TeamMembership).filter(TeamMembership.user_id == current_user.id).first()

    # Check if a team is found
    if team:
        # Determine if the current user is the owner of the team
        is_owner = team.owner_id == current_user.id
        
        # Return the team name, ID, and ownership status
        return jsonify({'id': team.id, 'name': team.name, 'isOwner': is_owner})

    # Return an error if no team is found
    return jsonify({'error': 'No team found'}), 404


    

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)
    points = db.Column(db.Integer, default=0)

    owned_teams = db.relationship('Team', back_populates='owner')
    teams = db.relationship('TeamMembership', back_populates='user')

class TeamMembership(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    rank = db.Column(db.String(50), nullable=False, default='Member')

    user = db.relationship('User', back_populates='teams')
    team = db.relationship('Team', back_populates='members')


@app.route('/team_members', methods=['GET'])
@login_required
def team_members():
    if current_user.teams:
        team_id = current_user.teams[0].team_id
        members = db.session.query(User, TeamMembership).join(TeamMembership).filter(TeamMembership.team_id == team_id).all()
        
        team_members_data = []
        for user, membership in members:
            member_info = {
                'username': user.username,
                'rank': membership.rank
            }
            team_members_data.append(member_info)
        
        return jsonify(team_members_data)
    return jsonify({'error': 'User is not part of any team.'}), 404


@app.route('/delete_team/<int:team_id>', methods=['DELETE'])
@login_required
def delete_team(team_id):
    # Fetch the team by ID
    team = Team.query.get(team_id)

    # Check if team exists and current user is the owner
    if team and team.owner_id == current_user.id:
        # Delete all memberships first
        TeamMembership.query.filter_by(team_id=team.id).delete()
        db.session.delete(team)
        db.session.commit()
        return jsonify({'message': 'Team deleted successfully!'}), 200
    else:
        return jsonify({'error': 'Team not found or unauthorized!'}), 404



@app.route('/team_stats', methods=['GET'])
@login_required
def team_stats():
    # Get the current user's team ID
    team_id = current_user.teams[0].team_id
    
    # Fetch all team members including the current user
    members = User.query.join(TeamMembership).filter_by(team_id=team_id).all()

    # Ensure the current user is included
    current_user_stats = {
        'username': current_user.username,
        'points': current_user.points
    }
    
    # Add current user's stats to the list if not already included
    if current_user_stats['username'] not in [m.username for m in members]:
        members.append(current_user_stats)

    # Format the stats to be sent as JSON
    team_stats = [{'username': member.username, 'points': member.points} for member in members]
    
    return jsonify(team_stats)




class Chore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    points = db.Column(db.Integer, nullable=False, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='chores')

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(256), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'))  # Link to the team
    user = db.relationship('User', backref='notifications')



@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/search_users', methods=['GET'])
@login_required
def search_users():
    query = request.args.get('query')
    users = User.query.filter(User.username.ilike(f'%{query}%')).all()
    user_list = [{'id': user.id, 'username': user.username} for user in users if user.id != current_user.id]
    return jsonify(user_list)

@app.route('/send_invite', methods=['POST'])
@login_required
def send_invite():
    data = request.get_json()
    user_id = data.get('user_id')
    user = User.query.get(user_id)

    if user:
        # Check if the current user is part of a team
        if not current_user.teams:
            # Automatically create a team for the user if they don't have one
            team_name = f"{current_user.username}'s Team"
            team = Team(name=team_name, owner_id=current_user.id)
            db.session.add(team)
            db.session.commit()

            # Add the current user to their own team with rank 'Owner'
            team_membership = TeamMembership(user_id=current_user.id, team_id=team.id, rank='Owner')
            db.session.add(team_membership)
            db.session.commit()

        # Proceed with sending the invite
        team_id = current_user.teams[0].team_id  # The team should now exist
        notification = Notification(user_id=user_id, message=f'{current_user.username} has invited you to join their team.', team_id=team_id)
        db.session.add(notification)
        db.session.commit()
        return jsonify({'message': 'Invite sent successfully!'})

    return jsonify({'error': 'User not found!'}), 404




@app.route('/accept_invite/<int:notification_id>', methods=['POST'])
@login_required
def accept_invite(notification_id):
    notification = Notification.query.get(notification_id)
    if notification and notification.team_id:
        # Add the user as a member with the rank 'Member'
        team_membership = TeamMembership(user_id=current_user.id, team_id=notification.team_id, rank='Member')
        db.session.add(team_membership)
        db.session.delete(notification)  # Remove the notification after acceptance
        db.session.commit()
        return jsonify({'message': 'Invite accepted and joined the team!'})
    return jsonify({'error': 'Notification not found or no team associated!'}), 404


@app.route('/remove_invite/<int:notification_id>', methods=['DELETE'])
@login_required
def remove_invite(notification_id):
    notification = Notification.query.get(notification_id)
    if notification and notification.user_id == current_user.id:
        db.session.delete(notification)
        db.session.commit()
        return jsonify({'message': 'Invite removed successfully!'})
    return jsonify({'error': 'Notification not found or unauthorized!'}), 404


@app.route('/notifications', methods=['GET'])
@login_required
def get_notifications():
    notifications = Notification.query.filter_by(user_id=current_user.id).all()
    notification_list = [{'id': n.id, 'message': n.message} for n in notifications]
    return jsonify(notification_list)

@app.route('/default_chores', methods=['GET'])
@login_required
def default_chores():
    default_chores_data = {
        "Indoor": [
            {
                "title": "Vacuum the house",
                "description": "Vacuum all rooms and hallways",
                "points": 5
            },
            {
                "title": "Dust shelves",
                "description": "Dust all shelves and surfaces",
                "points": 3
            },
            {
                "title": "Clean windows",
                "description": "Clean the windows in all rooms",
                "points": 4
            }
        ],
        "Outdoor": [
            {
                "title": "Mow the lawn",
                "description": "Mow the front and backyard lawn",
                "points": 6
            },
            {
                "title": "Weed the garden",
                "description": "Remove all weeds from the garden beds",
                "points": 4  
            },
            {
                "title": "Rake leaves",
                "description": "Rake all fallen leaves in the yard",
                "points": 5  
            }
        ]
    }
    return jsonify(default_chores_data)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    user = User.query.filter_by(username=username, password=password).first()
    if user:
        login_user(user)
        return jsonify({'message': 'Login successful'})
    else:
        return jsonify({'message': 'Login failed'}), 401




@app.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    chores = Chore.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': chore.id, 'title': chore.title, 'description': chore.description, 'category': chore.category, 'due_date': chore.due_date, 'points': chore.points} for chore in chores])

@app.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({'username': current_user.username, 'points': current_user.points})

@app.route('/add_chore', methods=['POST'])
@login_required
def add_chore():
    data = request.get_json()
    title = data.get('title', '')
    description = data.get('description', '')
    category = data.get('category', '')
    due_date = data.get('due_date', None)
    points = data.get('points', 0)  
    new_chore = Chore(title=title, description=description, category=category, due_date=due_date, user_id=current_user.id, points=points)
    db.session.add(new_chore)
    db.session.commit()
    return jsonify({'message': 'Chore added successfully'})

@app.route('/complete_chore/<int:chore_id>', methods=['POST'])
@login_required
def complete_chore(chore_id):
    chore = Chore.query.get(chore_id)
    if chore and chore.user_id == current_user.id:
        current_user.points += chore.points 
        db.session.delete(chore)
        db.session.commit()
        return jsonify({'message': 'Chore completed successfully'})
    return jsonify({'message': 'Chore not found or unauthorized'}), 404

@app.route('/complete_default_chore', methods=['POST'])
@login_required
def complete_default_chore():
    data = request.get_json()
    points = data.get('points', 0)
    current_user.points += points
    db.session.commit()
    return jsonify({'message': 'Chore completed and points awarded', 'points': current_user.points})

@app.route('/reset_points', methods=['POST'])
@login_required
def reset_points():
    current_user.points = 0
    db.session.commit()
    return jsonify({'message': 'Points reset successfully'})

@app.route('/user_stats', methods=['GET'])
@login_required
def user_stats():
    return jsonify({'username': current_user.username, 'points': current_user.points})

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
