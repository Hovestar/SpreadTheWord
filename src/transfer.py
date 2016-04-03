import socket
import thread
import bluetooth



def hostServer(mac,port):
	backlog = 1
	size = 1024
	sock = bluetooth.BluetoothSocket( bluetooth.RFCOMM )
	sock.bind(("",port))
	sock.listen(backlog)
	bluetooth.advertise_service(sock,'spartacus',description = mac);
	s = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM)
	s.bind((mac,port))
	s.listen(backlog)
	try:
		client, address = s.accept()
		while 1:
			data = client.recv(size)
			if data:
				print(data)
				client.send(data)
	except:	
		print("Closing socket")	
		client.close()
	s.close()
	sock.close()

def beClient(mac,port,text):
	s = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM)
	s.connect((mac,port))
	s.send(bytes(text, 'UTF-8'))
	s.close()

def sendOut(port,text):
	backlog = 1
	size = 1024
	#while(1): # Bad practice but essentially keeps finding devices and sending its data?
	others = bluetooth.find_service(name='spartacus')
	for other in others:
		thread.start_new_thread( beClient, (other['host'],port,text) )

if __name__=="__main__":
	mac = # this intentionally will raise an excception. Put in the bluetooth address
	port = 3 # if you change change on every freaking machine
	thread.start_new_thread(hostServer,(mac,port))
	text = ''
	if(text):
		sendOut(port,text);
