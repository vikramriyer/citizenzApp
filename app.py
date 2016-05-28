#!/data/anaconda2/bin/python

from flask import Flask, render_template, json, request, jsonify
from flask.ext.mysql import MySQL
from werkzeug import generate_password_hash, check_password_hash
import sqlite3

#applciation specific
app = Flask(__name__)

#initializing variables
posts=[{
    'type': "poll",
    'id': "1",
    'title': "As a citizen, what is the biggest problem you face? ",
    'options': [{
        'title': "Traffic & Parking",
        'votes': "0",
        'value': "true",
        'percentVote': "10"
    }, {
        'title': "Cleanliness & Waste Management",
        'votes': "0",
        'value': "false",
        'percentVote': "15"
    }, {
        'title': "Water Supply",
        'votes': "0",
        'value': "false",
        'percentVote': "45"
    }, {
        'title': "Unsatisfactory response from civic authorities",
        'votes': "0",
        'value': "false",
        'percentVote': "2"
    }, {
        'title': "Pollution",
        'votes': "0",
        'value': "false",
        'percentVote': "28"
    }],
    'canSubmit': "true",
    'isResultVisible': "true",
    'totalSubmits': "0",
    'selected': "Yes",
    'isMultiSelect': "false",
    'isNotification': "true"
}, {
    'type': "poll",
    'id': "2",
    'title': "Please select one of the Key Components as your top priority in Smart City",
    'options': [{
        'title': "Command and Control Center",
        'votes': "0",
        'value': "false",
        'percentVote': "60"
    }, {
        'title': "Intelligent Traffic Management Services",
        'votes': "0",
        'value': "false",
        'percentVote': "20"
    }, {
        'title': "Smart City Bus Services",
        'votes': "0",
        'value': "false",
        'percentVote': "20"
    }],
    'canSubmit': "false",
    'isResultVisible': "true",
    'totalSubmits': "0",
    'isMultiSelect': "false"
}, {
    'type': "grievance",
    'id': "3",
    'title': "Recurrent fires at the dump have caused conditions unfit for habitation for residents of the adjacent area",
    'status': "Work In Progress",
    'progress': "50",
    'canSubmit': "true",
    'interactions': [{
        'text': "40 residents of Chembur went on a hunger strike to protest against the frequent fires and smoke",
        'from': "Rahul Kumar",
        'on': "20th Jan 2016"
    }, {
        'text': "Neighbourhood surrounding to the dumping ground was identified as the city' most polluted area",
        'from': "Manoj Sharma",
        'on': "25th Jan 2016"
    }, {
        'text': "GHMC had decided to close down a section of the dumping ground and use it to generate 7 to 8 MW of power by methane extraction, Effective from 20th April 2016.",
        'from': "#PollutionControl",
        'on': "20th Aug 2015"
    }],
    'from': "Kishor Raj",
    'on': "15th Jan 2016"
}, {
    'type': "message",
    'id': "4",
    'title': "Good job done by #GHMC by Cleaning Husain Sagar and Developing it into Clean and Precious tourist attraction. Keep it Up!",
    'isNotification': "true",
    'from': "Anuresh Rathi",
    'on': "15th Feb 2016"
}]

#mysql specific
mysql = MySQL()
 
# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'root'
app.config['MYSQL_DATABASE_DB'] = 'citizenz_app'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)

#get requests, still to be modified to get from DB instead of json file
@app.route('/post/<string:poll>', methods=['GET'])
def get_polls(poll):
    polls = [p for p in posts if p['type'] == poll]
    return jsonify({'type_'+poll: polls})

@app.route('/post/<string:grievance>', methods=['GET'])
def get_grievances(grievance):
    grievances = [g for g in posts if g['type'] == grievance]
    return jsonify({'type_'+grievance: grievances})

@app.route('/post/<string:message>', methods=['GET'])
def get_messages(message):
    messages = [m for m in posts if m['type'] == message]
    return jsonify({'type_'+message: messages})

#post methods to be written, /post_poll /post_grievance /post_message, again DB integration to be done

@app.route('/poll',methods=['POST','GET'])
def signUp():
    try:
        # create user code will be here !!
        _name = request.form['inputName']
        _email = request.form['inputEmail']
        _id = request.form['inputId']
        _location = request.form['inputLocation']
        _password = request.form['inputPassword']

	    # validate the received values
        if _name and _email and _password and _id and _location:
            #conn = mysql.connect()
            conn = sqlite3.connect('citizenz')
            cursor = conn.cursor()
            _hashed_password = generate_password_hash(_password)
            cursor.callproc('sp_create_user',(_id,_name,_email,_location,_hashed_password))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                return json.dumps({'message':'User created successfully !'})
            else:
                return json.dumps({'error':str(data[0])})
    
        else:
            return json.dumps({'html':'<span>Please Enter the required fields</span>'})
	
    except Exception as e:
        return json.dumps({'error':str(e)})
    finally:
        cursor.close() 
        conn.close()

if __name__ == "__main__":
    app.run(debug=True, port=9001)
