
# AZURE AI DOCUMENT INTELLIGENCE - ANALYZE A DOCUMENT
# Analyzes a document using a custom Document Intelligence model
# and returns the extracted results.

from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

# CONNECT TO DOCUMENT INTELLIGENCE
document_analysis_client = DocumentAnalysisClient(
    endpoint="YOUR_DOC_INTELLIGENCE_ENDPOINT",
    credential=AzureKeyCredential(
        "YOUR_DOC_INTELLIGENCE_KEY"
    )
)

# ANALYZE THE DOCUMENT
task = (
    document_analysis_client.begin_analyze_document_from_url(
        model_id="YOUR_CUSTOM_BUILT_MODEL_ID",
        document_url="YOUR_DOCUMENT"
    )
)

# Wait for analysis to complete
result = task.result()

# RESULT
print(result)

#############################

from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

client = DocumentAnalysisClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key)
)

document_url = "https://example.com/invoice.pdf"

poller = client.begin_analyze_document_from_url(
    model_id="prebuilt-invoice",
    document_url=document_url
)

result = poller.result()

for invoice in result.documents:
    for name, field in invoice.fields.items():
        print(name, field.content)

###########################

import os
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

# 1. Read Azure resource configuration
endpoint = os.environ["DOCUMENT_INTELLIGENCE_ENDPOINT"]
key = os.environ["DOCUMENT_INTELLIGENCE_KEY"]

# 2. Create the Document Intelligence client
client = DocumentAnalysisClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key)
)

# 3. Open the invoice document
with open("invoice.pdf", "rb") as document:
    poller = client.begin_analyze_document(
        model_id="prebuilt-invoice",
        document=document
    )

    # 4. Wait for analysis to finish
    result = poller.result()

# 5. Print extracted text
print("\n--- Extracted Text ---")
for page in result.pages:
    for line in page.lines:
        print(line.content)

# 6. Print structured invoice fields
print("\n--- Invoice Details ---")

for invoice in result.documents:
    fields = invoice.fields

    for field_name in [
        "VendorName",
        "CustomerName",
        "InvoiceId",
        "InvoiceDate",
        "DueDate",
        "SubTotal",
        "TotalTax",
        "InvoiceTotal",
        "AmountDue"
    ]:
        field = fields.get(field_name)

        if field is not None:
            print(
                f"{field_name}: {field.content} "
                f"(confidence: {field.confidence})"
            )

    # 7. Print invoice line items
    items_field = fields.get("Items")

    if items_field and items_field.value_array:
        print("\n--- Line Items ---")

        for item in items_field.value_array:
            item_fields = item.value_object or {}

            for name, value in item_fields.items():
                print(f"  {name}: {value.content}")

            print("---")
