import os
import io
import boto3
from botocore.exceptions import ClientError
from cloudflare import AsyncCloudflare

s3 = boto3.client(
    's3',
    endpoint_url='https://01bfe18976de5cba71d36bff1729c0f3.r2.cloudflarestorage.com',
    aws_access_key_id='7e56402e1a48d508d4a41d8b7b91f899',
    aws_secret_access_key='7cf7c0ed113e9331b5d3e643598a61f92c9758da2c201b6f5c7c9b272b95d260',
    region_name="auto",
)

client = AsyncCloudflare(
    # This is the default and can be omitted
    api_email=os.environ.get("CLOUDFLARE_EMAIL"),
    # This is the default and can be omitted
    api_key=os.environ.get("CLOUDFLARE_API_KEY"),
)

BUCKET = "seeds"


class CloudF:
    client: AsyncCloudflare
    s3: any

    def __init__(self):
        self.client = client
        self.s3 = s3

    def upload_unless(self, key: str, body: str):
        object_information = None
        try:
            object_information = self.s3.head_object(Bucket=BUCKET, Key=key)
        except ClientError as e:
            error = e.response.get('Error', {})
            error_code = error.get('Code', 'Unknown')

            if error_code != '404':
                raise

        if object_information:
            return

        self.s3.upload_fileobj(io.BytesIO(bytes(body, 'utf-8')), BUCKET, key)


client = CloudF()
