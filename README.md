# Untis to Calendar

## Table of Contents
* [What is it good for?](#purpose)
* [How do I run it?](#run)

<a name="porpuse"></a>
## What is it good for?
Untis to Calendar is a project that enables you to sync your timetable from [WebUntis](https://webuntis.com/)  with any calendar application of your choice using an iCal link.
Currently, this project supports anonymous login to Untis.
<a name="run"></a>
## How do I run it?
To run the backend and to run the frontend you must have [NodeJs](https://nodejs.org) installed and ideally [pnpm](https://pnpm.io/).
1. Run the command `pnpm install` to install the necessary dependencies.
2. Create a `.env` file with the following configurations:
    * You need to specify an auth secret for jsonwebtoken. Example: `AUTH_SECRET="supersecretsecret"`
    * You need to define an url to be displayed in the ui. Example: `API_URL="http://localhost:3000"`
    * You need to set the data for your instance of PostgreSQL. Example: `DATABASE_URL="postgres://postgres:password@localhost:5432/untis-to-calender"`
3. Run the command `pnpm run dev` to run the application in developer mode.
