# DoChat PDF Service

Flask service for PDF and document uploads and chat prompts. It accepts
`POST /upload` and `POST /prompt` requests and listens on `127.0.0.1:5000`
when run directly.

## Run locally

Install the Python dependencies:

```sh
python -m pip install -r mean/pdfchat/pypdfservice/requirements.txt
```

Run the module from the workspace root so its project imports resolve:

```sh
python -m mean.pdfchat.pypdfservice.app
```

Configure any required AI-service credentials locally; do not commit them.
