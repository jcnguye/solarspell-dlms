# SolarSPELL-DLMS

This is the latest repository for the DLMS, which is one tool used to create the software loaded on a SolarSPELL. More information about SolarSPELL can be found [here](http://solarspell.org/).

## Installation

Before installation of the DLMS, make sure that Python 3.8+ and Node >= 10, <= 16 are installed.

### Python Dependencies

To install python dependencies, run this command in the base directory.

```bash
pip install -r requirements.txt
```

## Troubleshooting

#### psycopg2
For errors encountered installing psycopg2: link[https://stackoverflow.com/questions/5420789/how-to-install-psycopg2-with-pip-on-python] 

#### Pillow
For errors encountered installing Pillow: link[https://pillow.readthedocs.io/en/latest/installation.html]
It seems like the version of Pillow listed in the requirements.txt is too old for the latest releases of python, so it will need to be updated.
Pillow might also be completely unused? This needs to be tested though.

djangorestframework needs to be updated?

### Database

Create a PostgreSQL user and database.
```
sudo -u postgres createuser --interactive
sudo -u postgres createdb dlms
sudo -u postgres psql
ALTER USER username WITH PASSWORD 'password'
```

### Env File

Duplicate `env.example` from the /dlms directory, change the appropriate values, and rename it `.env`. This step must be done before the following steps will work.

### DB Migration

To initialize the database with the proper schema, you must run the folliwng command in the base directory.

```bash
python manage.py migrate
```

### Starting the Server

To start the server, you must run the following command in the base directory.

```bash
python manage.py runserver
```

### Frontend

To setup the NPM environment, you must run npm install in the frontend directory and then add the node_modules bin to your path.

```
cd frontend
npm install
add the node_modules/.bin/ to PATH Environment Variable - Required.
```

### Build Frontend

There are three build scripts depending on your environment. You may have to try them all to see which one works for you.

**Mac**

```
npm run-script build
```

**Bash/Linux**

```
npm run-script build-bash
```

**Windows**

```
npm run-script winbuild
```