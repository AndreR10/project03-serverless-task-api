# Cost estimation

This project is designed to stay inexpensive while you are learning. Most of the AWS services used here are serverless, which means they usually do not run all the time and do not cost much during normal development.

---

## Why this project is cheap

The main cost-saving choices are:

- Lambda runs only when the API is called
- API Gateway charges for requests, not for running servers
- DynamoDB is configured for small, simple workloads
- no EC2 instances need to stay running
- no always-on infrastructure is required

This is typical of a serverless application.

---

## Rough monthly estimate

For a low-usage learning project, the estimated monthly cost is usually close to zero unless you are making lots of requests or storing large amounts of data.

| Service | Expected cost |
| ------- | ------------- |
| AWS Lambda | Very low |
| API Gateway | Very low |
| DynamoDB | Very low |
| CloudWatch Logs | Low, but usually small |
| IAM | $0 |
| S3 | Usually very low |
| Terraform | $0 |
| Total | Usually near $0 for learning usage |

This is a rough estimate and depends on actual usage.

---

## AWS Lambda cost

Lambda charges are based on:

- number of requests
- execution time
- memory assigned to the function

This project keeps memory low and function execution simple, which helps keep costs down.

---

## API Gateway cost

API Gateway normally charges by request volume and data transfer.

For a small project used by one developer or a few test requests, the cost is typically very low.

---

## DynamoDB cost

DynamoDB charges are based on:

- reads and writes
- storage used
- table usage patterns

This project does not store large datasets, so the cost remains low.

---

## CloudWatch cost

CloudWatch is useful for logs and debugging, but log volume can increase costs if you log too much.

To keep it cheap:

- keep logs useful and concise
- avoid logging large payloads unnecessarily
- clean up unused logs when possible

---

## IAM cost

IAM does not normally cost money by itself. The main cost is not the IAM service itself, but the AWS resources it allows you to use.

---

## Terraform cost

Terraform is open source and free to use locally. The real cost comes from the AWS resources it creates, not from Terraform itself.

---

## What can increase cost?

The biggest cost drivers are usually:

- too many API calls
- large CloudWatch log volumes
- many Lambda executions
- large DynamoDB data growth
- accidental creation of expensive resources

This project avoids those issues by staying simple and serverless.

---

## Beginner takeaway

The project is designed to be low cost and beginner-friendly. In most cases, this kind of stack stays within free-tier-friendly usage while you are learning.

If you keep the app small and avoid unnecessary resources, the bill should stay very manageable.

| AWS Fargate               | Outside the project scope   |

---

# Monitoring Costs

You can monitor your AWS spending using:

- AWS Billing Dashboard
- AWS Cost Explorer
- AWS Budgets

These tools help identify unexpected charges early.

---

# Recommended AWS Budget

Create a monthly budget to receive alerts before costs become significant.

Suggested configuration:

| Setting         | Value       |
| --------------- | ----------- |
| Budget Type     | Cost Budget |
| Monthly Budget  | €5          |
| Alert Threshold | 80%         |
| Notification    | Email       |

This provides an early warning if spending exceeds expectations.

---

# Free Tier Best Practices

To remain within the Free Tier:

- Use serverless services whenever possible.
- Destroy unused infrastructure.
- Avoid creating duplicate environments.
- Keep Lambda memory allocation low.
- Use On-Demand billing for DynamoDB.
- Limit unnecessary API requests.
- Configure CloudWatch log retention.
- Monitor the Billing Dashboard regularly.

---

# Cost Optimization Checklist

Before leaving the project idle:

- ☐ Run `terraform destroy` if the environment is no longer needed.
- ☐ Remove unused Lambda functions.
- ☐ Delete unused CloudWatch log groups.
- ☐ Delete unused API Gateway stages.
- ☐ Remove orphaned IAM roles and policies.
- ☐ Verify there are no unused DynamoDB tables.

---

# Estimated Cost by Project Phase

| Phase   |                                           Expected Monthly Cost |
| ------- | --------------------------------------------------------------: |
| Phase 1 |                                                          ~€0.00 |
| Phase 2 |                                                          ~€0.00 |
| Phase 3 |               Low (depending on EventBridge, SNS and SQS usage) |
| Phase 4 | Low (additional monitoring and environments may increase usage) |

Even after all planned phases, careful usage should keep costs very low for a personal learning project.

---

# Key Takeaways

This project demonstrates how modern serverless architectures can provide a fully functional REST API while minimizing operational costs.

By selecting managed AWS services such as Lambda, API Gateway, and DynamoDB, the infrastructure automatically scales with demand and avoids paying for idle resources.

Understanding pricing is an important cloud engineering skill. Designing for cost efficiency from the beginning is considered a best practice and is a common topic in cloud architecture discussions and technical interviews.
