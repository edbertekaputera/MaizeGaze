# MaizeGaze
Welcome to our Maize Tassel Detection and Counting Project.
## Collaborators:
1. [Edbert Ekaputera @edbertekaputera](https://github.com/edbertekaputera)
2. [Chrisyella Gracia @chrisyellagracia](https://github.com/chrisyellagracia)
3. [Moon Jiwon @jiwonyah](https://github.com/jiwonyah)
4. [Dai Rui Mei @daicc33](https://github.com/daicc33)
5. [Aung Ko Ko Oo @aungkokooo18](https://github.com/aungkokooo18)
## Installation/Setup guide:

### 1. Flask API Server
First, setup your python 3.10 environment. Ideally, use a virtual environment like `miniconda`.

Then, install the dependencies as followed,
```bash
pip install -r requirements.txt
```

Then, we need to setup a `.env` file in the `/api` directory. This `.env` file should follow the following format. (Please make sure to replace the ones with `quotation marks`)
```properties
# Flask Secret Key
SECRET_KEY = 'YOUR_SECRET_KEY'
SECURITY_PASSWORD_SALT = 'YOUR_SECRET_SALT'

# Admin credentials
ADMIN_EMAIL = admin@admin.com
ADMIN_PASSWORD = admin
ADMIN_NAME = Administrator

# Mail
EMAIL_USER = 'YOUR_EMAIL'
EMAIL_PASSWORD = 'YOUR_EMAIL_PASSWORD'

# Client server
CLIENT_SERVER_URL = http://localhost:5173

# Database
DATABASE_URL = sqlite:///database.db

# Redis
REDIS_URL = redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'
GOOGLE_CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET'
GOOGLE_REDIRECT_URI = http://localhost:5000/api/authentication/oauth/login/google/authorized

# Github OAuth
GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID'
GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET'
GITHUB_REDIRECT_URI = http://localhost:5000/api/authentication/oauth/login/github/authorized
```

To run the server, simply run `application.py` as followed, and it should be hosted locally at `port 5000`
```bash
# Move to the API directory
cd api

# Start server
python application.py
```

### 2. React Web Server
First, install the dependencies as followed,
```bash
# Move to the client directory
cd client

# Install dependencies
npm install
```

To run the web server, simply run the following command, and it should be hosted locally at `port 5173`.
```bash
npm run dev
```

### 3. Redis Server (For session management)
First, make sure you have Docker. check out `https://www.docker.com/` if you don't.

Then, simply pull the image, create the container, and start it in one command as followed,
```bash
docker run -p 6379:6379 redis
```

This will run the redis server at `port 6379`, though you do not have to do this again. Simply use the following commands,
```bash
# To check currently running containers
docker ps

# To start a container
docker start <CONTAINER_NAME>

# To stop a container
docker stop <CONTAINER_NAME>
```

## Important Note:
Make sure you have all three servers running at the same time, so that the system can work properly.

If you want to add changes or contribute, please 
1. create your own `branch`
2. then start `developing and commiting on your own branch`.
3. push it, and create a `pull request` to merge it to `main`.

