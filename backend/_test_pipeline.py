import json
import time
import urllib.request

# 1. Create task
req = urllib.request.Request(
    "http://127.0.0.1:8001/api/studio/tasks",
    data=json.dumps({"topic": "AI Agent 发展趋势"}).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
resp = urllib.request.urlopen(req)
task = json.loads(resp.read())
tid = task["task_id"]
print(f"Created: {tid}, status={task['status']}, stages={len(task['stages'])}")

# 2. Run pipeline
req2 = urllib.request.Request(
    f"http://127.0.0.1:8001/api/studio/tasks/{tid}/run", method="POST"
)
resp2 = urllib.request.urlopen(req2, timeout=30)
data = resp2.read().decode()
print(f"Pipeline SSE response length: {len(data)} chars")

# 3. Check final state
req3 = urllib.request.Request(f"http://127.0.0.1:8001/api/studio/tasks/{tid}")
resp3 = urllib.request.urlopen(req3)
final = json.loads(resp3.read())
print(f"Final status: {final['status']}")
for s in final["stages"]:
    print(f"  {s['kind']}: {s['status']} - {s.get('summary','')}")
print(f"Article title: {final['article_title']}")
print(f"Has evidence: {final['evidence_pack'] is not None}")
print(f"Has verification: {final['verification_report'] is not None}")
