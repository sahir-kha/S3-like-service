# S3-like-service

Post request is not able to upload the file perfectly with multer from swagger  please try Postman 

To run the project:(node version 16.16.0)

step1: npm install

step2: node index.js

Note: All API's are tested with postman 

parameter->  bucketId = uploads  //name of the folder in the router
             objecctid= name of the file 

database configuration:

database Tables: (mysql database)

    buckets -> CREATE TABLE buckets (
                id INT NOT NULL AUTO_INCREMENT,
                bucketName VARCHAR(255),
                PRIMARY KEY (id),
                UNIQUE KEY idx_bucketid (bucketName)
            );


    objects-> CREATE TABLE objects (
                id INT NOT NULL AUTO_INCREMENT,
                bucket_id INT,
                object_name VARCHAR(255),
                file_path VARCHAR(255) NOT NULL,
                PRIMARY KEY (id),
                KEY objects_ibfk_1 (bucket_id),
                CONSTRAINT objects_ibfk_1 FOREIGN KEY (bucket_id) REFERENCES buckets (id)
            );

Swagger url -> http://localhost:3000/api-docs/


