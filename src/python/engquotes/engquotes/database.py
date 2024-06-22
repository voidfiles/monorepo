from peewee import *
from playhouse.apsw_ext import *
import apsw
import boto3
import sqlite_s3vfs
import os

# A boto3 bucket resource
bucket = boto3.Session().resource('s3').Bucket(os.environ['AWS_BUCKET'])

# An S3VFS for that bucket
s3vfs = sqlite_s3vfs.S3VFS(bucket=bucket)

db = APSWDatabase('engquotes.db')

db.init('engquotes.db', vfs=s3vfs.name)
