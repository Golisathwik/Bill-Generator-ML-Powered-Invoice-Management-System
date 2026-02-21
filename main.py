import webview
from app import app, db

if __name__ == '__main__':
    # Create the database tables if they don't exist
    with app.app_context():
        db.create_all()

    # Create and start the PyWebView window
    # This will run the Flask app automatically
    webview.create_window('Bill Generator', app)
    webview.start(debug=False) # Set debug=False for the final version