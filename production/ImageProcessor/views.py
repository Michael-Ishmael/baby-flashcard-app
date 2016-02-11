#from django.core.files.uploadedfile import UploadedFile
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.shortcuts import render, render_to_response, redirect

# Create your views here.
from django.views.decorators.http import require_POST
from django.conf import settings

import simplejson
import os


from django.http import JsonResponse

from production.business.imagedata import Workflow


def index(request):
    # company_cnt = request.GET.get('top')
    # path = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/proudction-ui/media'
    path = settings.MEDIA_ROOT
    workflow = Workflow(path)
    workflow.load()

    try:
        return JsonResponse(workflow.to_json_dict())
    except Exception as ex:
        return JsonResponse({"success": False, "message": ex.message})


    return JsonResponse(j_comps, safe=False)

    # context = {
    #     'testValue': 'bebe',
    # }
    # return render(request, 'imageprocessor/imageprocessing.html', context)


@require_POST
def update_image_data(request):
    try:
        data = simplejson.loads(request.body)
        if data:
            path = settings.MEDIA_ROOT
            data_file_name = 'data.json'
            with open(os.path.join(path, data_file_name), 'w') as json_file:
                simplejson.dump(data, json_file)
                #image_name = data["imagename"]
            result = {"success": True}
        else:
            result = {"success": False, "message": 'no data uploaded'}
    except Exception as ex:
        result = {"success": False, "message": ex.message}
    return JsonResponse(result)



# @require_POST
# def add_company(request):
#     try:
#         data = simplejson.loads(request.body)
#         if data:
#             company = Company()
#             company.Name = data['name']
#             company.RegisteredNumber = data['registerednumber']
#             company.save()
#             result = {"success": True}
#         else:
#             result = {"success": False, "message": 'No company uploaded'}
#     except Exception as ex:
#         result = {"success": False, "message": ex.message}
#     return JsonResponse(result)

