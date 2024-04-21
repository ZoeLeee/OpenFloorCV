from flask import Flask,request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from ultralytics import YOLO

app = Flask(__name__, static_folder='runs')
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

# 识别图片
def detect(file):
    # 如果file不存在，退出
    if not os.path.exists(file):
        return jsonify({'error': 'File not found'}), 404
    YOLO.detect(file=file)


@app.route('/render', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # 如果runs/uploads文件夹不存在，则创建
        if not os.path.exists('runs/uploads'):
            os.makedirs('runs/uploads')
        # 保存文件到runs/uploads文件夹
        file.save(os.path.join('runs/uploads', secure_filename(file.filename)))

        print(os.path.join('runs/uploads', secure_filename(file.filename)))

        return jsonify({'message': 'File successfully uploaded'}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}


if __name__ == '__main__':
    app.run(debug=True)