#!/data/anaconda2/bin/python

#This is import section
from flask import Flask, render_template, json, request, jsonify
from flask.ext.mysql import MySQL
from flask.ext.restful import Api
from werkzeug import generate_password_hash, check_password_hash
from flask.ext.cors import CORS


#applciation specific
app = Flask(__name__)
#app.config.from_object('config')
#CORS(app)
api = Api(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

#mysql specific
mysql = MySQL()
 
# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'root'
app.config['MYSQL_DATABASE_DB'] = 'citizenz_app'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)

#authenticate user against password in user table
@app.route('/login', methods=['GET', 'POST'])
def authenticate_user():
    #get user entered data
    try:
        _u_name = request.args['username']
        _password = request.args['password']

        #establish mysql connection and call stored procedure sp_auth
        conn = mysql.connect()
        cursor = conn.cursor()

        cursor.callproc('sp_auth_user',(_u_name,_password))
        #cursor.execute('auth', (_u_name, _hashed_password))
        data = cursor.fetchall()

        if str(data[0][0]) == str('1'):
            return json.dumps({'message':'User authenticated successfully !'})
        else:
            return json.dumps({'error':'Username or Password incorrect'})

    except Exception as e:
        return json.dumps({'error':str(e)})
    finally:
        cursor.close() 
        conn.close()

#get requests, specific to type of post (poll, grievance, message)
@app.route('/post/<string:poll>', methods=['GET'])
def get_polls(poll):
    try:
        sql_get_options = "select * from options O where O.option_id in (select OP.option_id from options_post OP where OP.post_id in (select post_id from post P where P.type_id in (select post_id from post_type PT where PT.type ='poll' )))"
        sql_get_polls = "select * from post P where P.type_id in (select post_id from post_type PT where PT.type ='poll' );"
        
        #establish connection
        conn = mysql.connect()
        cursor = conn.cursor()

        dict_of_poles = {}
        dict_of_options = {}

        #polls
        cursor.execute(sql_get_polls)
        data_polls = cursor.fetchall()

        for row in data_polls:
            dict_of_poles['post_id'] = row[0]
            dict_of_poles['type_id'] = row[1]
            dict_of_poles['user_id'] = row[2]
            dict_of_poles['can_submit'] = row[3]
            dict_of_poles['_is_result_visible'] = row[4]
            dict_of_poles['total_submits'] = row[5]
            dict_of_poles['_is_multi_select'] = row[6]
            dict_of_poles['current_status'] = row[7]
            dict_of_poles['title'] = row[8]
            dict_of_poles['lcoation'] = row[9]

        #options
        cursor.execute(sql_get_options)
        data_options = cursor.fetchall()

        for row in data_options:
            dict_of_options['option_id'] = row[0]
            dict_of_options['title'] = row[1]
            dict_of_options['votes'] = row[2]
            dict_of_options['percent_vote'] = row[3]

        data_dict = {}
        data_dict['0'] = data_polls
        data_dict['1'] = data_options

        return jsonify(data_dict) 

    except Exception as e:
        return json.dumps({'error':str(e)})

    finally:
        cursor.close()
        conn.close()

@app.route('/post/<string:grievance>', methods=['GET'])
def get_grievances(grievance):
    try:
        sql_get_interactions = "select * from interactions I where I.interaction_id in (select IP.interaction_id from interactions_post IP where IP.post_id in (select post_id from post P where P.type_id in (select post_id from post_type PT where PT.type ='grievance' )));"
        sql_get_grievances = "select * from post P where P.type_id in (select post_id from post_type PT where PT.type ='grievance' );"
        
        #establish connection
        conn = mysql.connect()
        cursor = conn.cursor()

        #options
        cursor.execute(sql_get_interactions)
        data_interactions = cursor.fetchall()

        #polls
        cursor.execute(sql_get_grievances)
        data_grievances = cursor.fetchall()

        return json.dumps({'interactions':data_interactions}, {'grievances':data_grievances})

    except Exception as e:
        return json.dumps({'error':str(e)})

    finally:
        cursor.close()
        conn.close()

@app.route('/post/<string:message>', methods=['GET'])
def get_messages(message):
    try:
        sql_get_messages = "select * from post P where P.type_id in (select post_id from post_type PT where PT.type ='message' );"
        
        #establish connection
        conn = mysql.connect()
        cursor = conn.cursor()

        #messages
        cursor.execute(sql_get_messages)
        data_messages = cursor.fetchall()

        return json.dumps({'messages':data_messages})

    except Exception as e:
        return json.dumps({'error':str(e)})

    finally:
        cursor.close()
        conn.close()
    
@app.route('/loggedInUserInfo', methods=['GET', 'POST'])
def get_user_info():
    #get user entered data
    try:
        _u_name = request.args['username']
        #establish mysql connection and call stored procedure sp_auth
        conn = mysql.connect()
        cursor = conn.cursor()

        sql = "select * from user where uname = '%s'" %(_u_name)
        cursor.execute(sql)
        data = cursor.fetchall()

        return json.dumps({'user_info':data})

    except Exception as e:
        return json.dumps({'error':str(e)})

    finally:
        cursor.close()
        conn.close()

@app.route('/post', methods=['POST'])
def insert_a_post_into_db():
    try:
        #post data is created
        _post_id = request.form['postId']
        _type_id = request.form['typeId']
        _user_id = request.form['userId']
        _title = request.form['title']
        _can_submit = request.form['canSubmit']
        _is_result_visible = request.form['isResultVisible']
        _total_submits = request.form['totalSubmits']
        _is_multi_select = request.form['isResultVisible']

        #validate received data
        if _post_id and _type_id and _user_id and _title and _can_submit and _is_result_visible and _total_submits and _is_multi_select:
            #connection to mysql opened
            pass
    except:
        pass

if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True, port=9001)
