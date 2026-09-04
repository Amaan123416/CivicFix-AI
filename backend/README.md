# CivicFix AI Backend

## MongoDB Atlas setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and remember its username and password.
3. In **Network Access**, add your current IP address. For temporary local testing, Atlas also allows `0.0.0.0/0`, but an IP allowlist is safer.
4. Select **Connect > Drivers**, copy the Node.js connection string, and replace `<username>`, `<password>`, and `<cluster>`.
5. Copy `.env.example` to `.env` and set `MONGODB_URI` to that Atlas string. Keep `.env` private.

The database name in the connection string should be `civicfix` so the application uses the expected database.

## Run

```bash
npm install
npm run dev
```

The API runs at `http://localhost:5000` by default.

## Botpress complaint submission

Configure a Botpress Execute action or webhook request to call your **publicly
reachable** backend URL:

```text
POST https://YOUR-PUBLIC-BACKEND-DOMAIN/api/webhooks/botpress
Content-Type: application/json
```

Do not use `localhost` in Botpress. The Botpress cloud server cannot access a
server running on your computer. For local testing, expose port 5000 with a
tunnel such as ngrok, or deploy the backend first.

Send the collected complaint values in `data`. The citizen must be identified by
the registered account email (or by `citizenId`):

```json
{
	"data": {
		"title": "Broken streetlight",
		"description": "The light has been off for three nights.",
		"category": "Streetlight",
		"priority": "Medium",
		"location": "Main Road, Ward 2",
		"email": "citizen@example.com"
	}
}
```

The email must belong to an already registered CivicFix citizen. In Botpress,
create these workflow variables before the final message:

```text
workflow.complaintId
workflow.confirmationMessage
```

After the HTTP request, map the response fields as follows:

```text
workflow.complaintId = response.complaintId
workflow.confirmationMessage = response.confirmationMessage
```

The response includes `complaintId` (for example, `CIV-6a9...`),
`mongoComplaintId`, and `confirmationMessage`. In the final Botpress message,
display:

```text
🎉 Your complaint has been submitted successfully!

We have recorded your civic issue. You can use the Complaint ID to track its status later.

🆔 Your Complaint ID: {{workflow.complaintId}}
```