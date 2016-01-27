from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader;
# Create your views here.



def index(request):
    #latest_question_list = Question.objects.order_by('-pub_date')[:5]

    context = {
        'testValue': 'bebe',
    }
    return render(request, 'imageprocessor/imageprocessing.html', context)


def processImage(request, image_id):
    x = image_id
    y = x


