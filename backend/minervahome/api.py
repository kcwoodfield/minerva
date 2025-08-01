from ninja import NinjaAPI, Schema
from ninja_extra import NinjaExtraAPI
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import NinjaJWTDefaultController

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)
api.add_router("/library", "libraries.api.router")


class UserSchema(Schema):
    username: str
    is_authenticated: bool
    # is not request.user.is_authenticated
    email: str = None


@api.get("/test")
def test(request):
    print(request)
    return "test"


@api.get("/user", response=UserSchema, auth=JWTAuth())
def user(request):
    print(request)
    return request.user
