from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth import logout
from django.contrib import messages
from datetime import datetime

from django.http import JsonResponse
from django.contrib.auth import login, authenticate
import logging
import json
from django.views.decorators.csrf import csrf_exempt

from .populate import initiate
from .models import CarMake, CarModel
from .restapis import get_request, analyze_review_sentiments, post_review


logger = logging.getLogger(__name__)


@csrf_exempt
def login_user(request):
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]

    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    else:
        data = {"userName": username, "status": "Failed"}

    return JsonResponse(data)


@csrf_exempt
def logout_request(request):
    logout(request)
    data = {"userName": ""}
    return JsonResponse(data)


@csrf_exempt
def registration(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data["userName"]
        password = data["password"]
        first_name = data["firstName"]
        last_name = data["lastName"]
        email = data["email"]

        username_exists = User.objects.filter(username=username).exists()

        if username_exists:
            return JsonResponse({"status": False, "error": "Already Registered"})

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )

        login(request, user)

        return JsonResponse({"userName": username, "status": True})


def get_cars(request):
    count = CarModel.objects.filter().count()

    if count == 0:
        initiate()

    car_models = CarModel.objects.select_related('car_make')
    cars = []

    for car_model in car_models:
        cars.append({
            "CarModel": car_model.name,
            "CarMake": car_model.car_make.name
        })

    return JsonResponse({"CarModels": cars})

# Update the `get_dealerships` view to render all dealerships
# or dealerships filtered by state
def get_dealerships(request, state="All"):

    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/" + state

    dealerships = get_request(endpoint)

    return JsonResponse({
        "status": 200,
        "dealers": dealerships
    })


# Create a `get_dealer_reviews` view to render dealer reviews
# and analyze review sentiments
def get_dealer_reviews(request, dealer_id):

    endpoint = "/fetchReviews/dealer/" + str(dealer_id)

    reviews = get_request(endpoint)

    for review in reviews:

        text = review.get("review", "")

        sentiment_response = analyze_review_sentiments(text)

        if sentiment_response:
            review["sentiment"] = sentiment_response.get("sentiment")
        else:
            review["sentiment"] = "neutral"

    return JsonResponse({
        "status": 200,
        "reviews": reviews
    })


# Create a `get_dealer_details` view to render dealer details
def get_dealer_details(request, dealer_id):

    endpoint = "/fetchDealer/" + str(dealer_id)

    dealer = get_request(endpoint)

    return JsonResponse({
        "status": 200,
        "dealer": dealer
    })


# Create an `add_review` view to submit a dealer review
def add_review(request):

    if request.user.is_anonymous is False:

        data = json.loads(request.body)

        try:

            response = post_review(data)

            print(response)

            return JsonResponse({
                "status": 200
            })

        except:

            return JsonResponse({
                "status": 401,
                "message": "Error in posting review"
            })

    return JsonResponse({
        "status": 403,
        "message": "Unauthorized"
    })