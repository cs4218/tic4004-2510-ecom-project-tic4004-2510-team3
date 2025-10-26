pre-requsits:
docker desktop installed

create file Dockerfile under projects
create file Dockerfile under project/clients

#Open vs code terminal
# Navigate to your project root
cd ProjectLocation

# Build backend image
docker build -t ecommerce-backend:latest -f Dockerfile .

# Build frontend image  
cd client
docker build -t ecommerce-frontend:latest -f Dockerfile .
cd ..

#check images build
docker images


# Test backend
docker run -p 6060:6060 ecommerce-backend:latest

# Test frontend (in new terminal)
docker run -p 3000:80 ecommerce-frontend:latest

#create folder k8s, place your security yaml files inside
#run below in terminal, if have error run 2 times
kubectl apply -f k8s/