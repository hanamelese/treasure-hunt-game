# treasure-hunt-game
# Contributors

  1 	Hana Melese 	UGR/3687/15

  2 	Lensa Yadesa 	UGR/8593/15

  3 	Martha Birhanu 	UGR/1363/15

  4 	Rita Ayalew 	UGR/7639/15

  5 	Hawi Mekonnen 	UGR/5788/15

#Setup and configuration

git clone https://github.com/hanamelese/treasure-hunt-game.git

cd treasure-hunt-game

npm install

npm start


## Backend Setup

To configure the backend, you will need to create your own `config.env` file. This file should contain your MongoDB URI and the port number for the application. Follow the steps below:

1. **Create a `config.env` file** in the root directory of your project.

2. **Add the following configuration** to your `config.env` file:

    ```plaintext
    DATABASE=your_mongodb_uri_here
    SESSION_SECRET=a_long_random_string
    PORT=your_port_number_here
    ```

   - `DATABASE` - your MongoDB connection string.
   - `SESSION_SECRET` - a long random string used to sign session cookies. Required; the app refuses to start without it. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `PORT` - local development only (e.g. `3000`). Not used when deployed to Vercel.

   When deploying to Vercel, set `DATABASE` and `SESSION_SECRET` in Settings -> Environment Variables instead of using `config.env`.

3. **Ensure that the `config.env` file is listed in your `.gitignore`** file to prevent it from being pushed to the repository:

    ```plaintext
    # .gitignore
    config.env
    ```

With these steps, your backend will be properly configured to connect to your MongoDB database.
