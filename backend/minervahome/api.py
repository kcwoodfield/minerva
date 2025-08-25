from ninja_extra import NinjaExtraAPI

api = NinjaExtraAPI()
api.add_router("/library", "libraries.api.router")
