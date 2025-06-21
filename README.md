# treasure-hunt-game
# Contributors

  1 	Hana Melese 	UGR/3687/15

  2 	Lensa Yadesa 	UGR/8593/15

  3 	Martha Birhanu 	UGR/1363/15

  4 	Rita Ayalew 	UGR/7639/15

  5 	Hawi Mekonnen 	UGR/5788/15

#Setup and configuration

git clone https://github.com/hanamelese/treasure-hunt-game

cd Mystery-Mansion-TreasureHuntGame

npm install

cd src

node app.js


## Backend Setup

To configure the backend, you will need to create your own `config.env` file. This file should contain your MongoDB URI and the port number for the application. Follow the steps below:

1. **Create a `config.env` file** in the root directory of your project.

2. **Add the following configuration** to your `config.env` file:

    ```plaintext
    DATABASE=your_mongodb_uri_here
    PORT=your_port_number_here
    ```

   Replace `your_mongodb_uri_here` with your actual MongoDB connection string and `your_port_number_here` with the desired port number (e.g., `3000`).

3. **Ensure that the `config.env` file is listed in your `.gitignore`** file to prevent it from being pushed to the repository:

    ```plaintext
    # .gitignore
    config.env
    ```

With these steps, your backend will be properly configured to connect to your MongoDB database.
