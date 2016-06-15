# from django.core.files.uploadedfile import UploadedFile
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.shortcuts import render, render_to_response, redirect

# Create your views here.
from django.views.decorators.http import require_POST
from django.conf import settings

import simplejson
import os

from django.http import JsonResponse

from production.business.FileCompiler import FileCompiler
from production.business.Workflow import Workflow
from shutil import copyfile
from os import path

def resources(request):
    workflow = Workflow(settings.MEDIA_ROOT)
    workflow.load()
    return HttpResponse(simplejson.dumps(workflow.to_json_dict(), indent=2), content_type="application/json")


def index(request):
    path = os.path.join(settings.MEDIA_ROOT, 'data2.json')
    with open(path, 'r') as json_file:
        data = simplejson.load(json_file)

    # try:
    return HttpResponse(simplejson.dumps(data, indent=2), content_type="application/json")
    # except Exception as ex:
    #    return JsonResponse({"success": False, "message": ex.message})

    # return JsonResponse(j_comps, safe=False)

    # context = {
    #     'testValue': 'bebe',
    # }
    # return render(request, 'imageprocessor/imageprocessing.html', context)

@require_POST
def move_file(request):
    try:

        image_key = request.POST.get("title", "")

        src_path = path.join(settings.MEDIA_ROOT, 'cropping.csv')
        tgt_path = path.join(settings.PROD_TARGET, 'cropping.csv')

        creator = FileCompiler()
        creator.dump_image("123")

        copyfile(src_path, tgt_path)
        result = {"success": True}

    except Exception as ex:
        result = {"success": False, "message": ex.message}

    return JsonResponse(result)


@require_POST
def update_image_data(request):
    try:
        data = simplejson.loads(request.body)
        if data:
            path = settings.MEDIA_ROOT
            data_file_name = 'data2.json'
            with open(os.path.join(path, data_file_name), 'w') as json_file:
                simplejson.dump(data, json_file)
                # image_name = data["imagename"]
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
