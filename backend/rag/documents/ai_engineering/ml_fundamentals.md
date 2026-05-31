# AI & ML Engineering Interview Preparation

## Machine Learning Fundamentals

### Supervised Learning
- **Classification**: Predicting discrete labels (spam/not spam, sentiment)
- **Regression**: Predicting continuous values (price, temperature)
- Common algorithms: Linear Regression, Logistic Regression, Decision Trees, Random Forest, SVM, Neural Networks

### Unsupervised Learning
- **Clustering**: K-Means, DBSCAN, Hierarchical Clustering
- **Dimensionality Reduction**: PCA, t-SNE, UMAP
- **Anomaly Detection**: Isolation Forest, One-Class SVM

### Model Evaluation Metrics
- **Classification**: Accuracy, Precision, Recall, F1-Score, AUC-ROC
- **Regression**: MSE, RMSE, MAE, R-squared
- **Cross-validation**: K-Fold, Stratified K-Fold, Leave-One-Out

## Deep Learning

### Neural Network Architectures
- **CNN**: Image recognition, object detection. Key: convolution layers, pooling, feature maps.
- **RNN/LSTM/GRU**: Sequential data, time series. Key: hidden states, gates, memory cells.
- **Transformer**: NLP, attention mechanism. Key: self-attention, multi-head attention, positional encoding.
- **GAN**: Generative models. Key: generator vs discriminator, adversarial training.

### Transfer Learning
Using pre-trained models for new tasks:
- **Feature Extraction**: Freeze base model, train new head
- **Fine-tuning**: Unfreeze some layers, train with lower learning rate
- Popular models: ResNet, BERT, GPT, ViT

## Large Language Models (LLMs)

### Key Concepts
- **Tokenization**: BPE, WordPiece, SentencePiece
- **Attention Mechanism**: Query, Key, Value matrices. Self-attention computes relevance between all token pairs.
- **Fine-tuning Methods**: Full fine-tuning, LoRA, QLoRA, Adapter layers
- **Prompt Engineering**: Zero-shot, Few-shot, Chain-of-Thought, Tree-of-Thought

### RAG (Retrieval-Augmented Generation)
Architecture for grounding LLM responses in external knowledge:
1. **Document Ingestion**: Chunk documents, create embeddings
2. **Vector Storage**: Store in FAISS, Pinecone, Weaviate, ChromaDB
3. **Retrieval**: Semantic search using cosine similarity
4. **Augmentation**: Inject retrieved context into LLM prompt
5. **Generation**: LLM generates grounded response

Best practices:
- Chunk size: 256-512 tokens with overlap
- Embedding models: all-MiniLM-L6-v2, text-embedding-ada-002
- Reranking: Cross-encoder for precision improvement
- Hybrid search: Combine dense (vector) + sparse (BM25) retrieval

### LLM Application Patterns
- **Agent Systems**: LangChain, LangGraph, AutoGen for autonomous task execution
- **Function Calling**: LLM selects and invokes tools/APIs
- **Multi-Agent Orchestration**: Specialized agents collaborating via shared state
- **Memory Systems**: Short-term (conversation), Long-term (vector DB), Episodic (summaries)

## MLOps

### Model Deployment
- **Serving**: TorchServe, TensorFlow Serving, FastAPI, Triton
- **Containerization**: Docker + Kubernetes for scaling
- **A/B Testing**: Gradual rollout, canary deployments
- **Monitoring**: Model drift detection, performance tracking

### Data Pipeline
- **ETL/ELT**: Apache Airflow, dbt, Prefect
- **Feature Store**: Feast, Tecton for feature management
- **Experiment Tracking**: MLflow, Weights & Biases, Neptune
