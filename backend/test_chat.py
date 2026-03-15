import sys
import os
sys.path.insert(0, os.getcwd())

from dotenv import load_dotenv
load_dotenv(override=True)

from app.analysis.ai_chat import answer_question
print(answer_question("This is a rental agreement for 12 months.", "How long is the rental?"))
