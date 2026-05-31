# System Design Interview Preparation

## Scalability Fundamentals

### Horizontal vs Vertical Scaling
- **Vertical Scaling**: Adding more power (CPU, RAM) to existing servers. Simple but has limits.
- **Horizontal Scaling**: Adding more servers. More complex but virtually unlimited scale.

### Load Balancing
Load balancers distribute traffic across multiple servers. Common algorithms:
- **Round Robin**: Requests distributed sequentially
- **Least Connections**: Routes to server with fewest active connections
- **Weighted**: Routes based on server capacity
- **IP Hash**: Same client always goes to same server (session affinity)

Popular tools: Nginx, HAProxy, AWS ALB, Azure Load Balancer.

## Database Design

### SQL vs NoSQL
- **SQL (Relational)**: ACID compliance, structured schemas, joins. Use for: transactions, complex queries.
  - PostgreSQL, MySQL, SQL Server
- **NoSQL**: Flexible schemas, horizontal scaling. Types:
  - **Document**: MongoDB, CouchDB (JSON-like documents)
  - **Key-Value**: Redis, DynamoDB (simple lookups)
  - **Column-Family**: Cassandra, HBase (time-series, analytics)
  - **Graph**: Neo4j, Amazon Neptune (relationship-heavy data)

### Database Sharding
Splitting data across multiple database instances:
- **Hash-based**: Shard key determines which shard stores the data
- **Range-based**: Data split by ranges (e.g., A-M on shard 1, N-Z on shard 2)
- **Geographic**: Data stored near users for lower latency

### Caching Strategies
- **Cache-Aside**: App checks cache first, falls back to DB
- **Write-Through**: Write to cache and DB simultaneously
- **Write-Behind**: Write to cache, async write to DB
- **Read-Through**: Cache handles DB reads transparently

Tools: Redis, Memcached, CDN (CloudFront, Azure CDN).

## Distributed Systems

### CAP Theorem
A distributed system can only guarantee 2 of 3:
- **Consistency**: Every read gets the most recent write
- **Availability**: Every request gets a response
- **Partition Tolerance**: System works despite network failures

### Message Queues
For asynchronous communication between services:
- **Apache Kafka**: High-throughput, event streaming
- **RabbitMQ**: Traditional message broker, complex routing
- **Amazon SQS**: Managed, simple queue service
- **Redis Pub/Sub**: Lightweight, real-time messaging

### Microservices Patterns
- **API Gateway**: Single entry point for all clients
- **Service Discovery**: Services find each other dynamically
- **Circuit Breaker**: Prevent cascade failures
- **Saga Pattern**: Distributed transactions across services
- **Event Sourcing**: Store state changes as sequence of events

## Common System Design Questions

### Design a URL Shortener
Key components: hash function, database, redirect service, analytics.
Scale considerations: read-heavy workload, caching, distributed ID generation.

### Design a Chat Application
Key components: WebSocket connections, message queue, presence service, push notifications.
Scale considerations: connection management, message ordering, offline message delivery.

### Design a Rate Limiter
Algorithms: Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log.
Implementation: Redis-based counters, middleware pattern.
