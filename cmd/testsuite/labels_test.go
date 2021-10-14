//nolint: noctx
package main

import (
	"bytes"
	"net/http"
	"testing"
	"time"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"

	"golang.cisco.com/examples/argome/gen/bookv1"
	"golang.cisco.com/examples/argome/gen/fridgeappv1"

	. "github.com/smartystreets/goconvey/convey"
)

func fieldSelectorTest(t *testing.T) {
	publisherID := ""
	Convey("Create a book",
		t, func(c C) {
			book := bookv1.BookFactory()
			So(core.NewError(book.SpecMutable().SetName("Batman"),
				book.SpecMutable().SetDescription("Not Quite Harry Potter"),
				book.SpecMutable().SetPublisherSelectorSpec(mo.OperatorHolder{
					MatcherOp: mo.NewOperatorEqual("spec.favPet.name", "Tommy")})), ShouldBeNil)
			doc, err := mo.JSONSerdeFromContext(testCtx).Marshal(mo.MarshalContextUnknown, book)
			So(err, ShouldBeNil)
			resp, err := http.Post(booksURL, "application/json", bytes.NewReader(doc))
			So(err, ShouldBeNil)
			So(resp.StatusCode, ShouldEqual, http.StatusCreated)
			objs, err := readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
		})
	Convey("Create a publisher",
		t, func(c C) {
			publisher := bookv1.PublisherFactory()
			pet := fridgeappv1.PetFactory(publisher, mo.ResourceRoleSpec)
			So(core.NewError(pet.SetName("Tommy"), pet.SetType("cat"), pet.SetBreed("Unknown")), ShouldBeNil)
			So(core.NewError(
				publisher.SpecMutable().SetSs("111-222-333"),
				publisher.SpecMutable().SetPets([]fridgeappv1.Pet{pet}),
				publisher.SpecMutable().SetFavPet(pet)), ShouldBeNil)
			doc, err := mo.JSONSerdeFromContext(testCtx).Marshal(mo.MarshalContextUnknown, publisher)
			So(err, ShouldBeNil)
			resp, err := http.Post(publishersURL, "application/json", bytes.NewReader(doc))
			So(err, ShouldBeNil)
			So(resp.StatusCode, ShouldEqual, http.StatusCreated)
			objs, err := readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			publisherID = objs[0].Meta().ID()
		})
	Convey("Check if the publisher was selected by the book",
		t, func(c C) {
			So(waitForCondition(func() bool {
				resp, err := http.Get(booksURL)
				if err != nil {
					return false
				}
				objs, err := readResponse(resp)
				if err != nil {
					return false
				}
				if len(objs) != 1 {
					return false
				}
				book, ok := objs[0].(bookv1.Book)
				So(ok, ShouldBeTrue)
				if book.Status().PublisherSelectorStatusPtr() == nil {
					return false
				}
				resolvedIDs := book.Status().PublisherSelectorStatus().ResolvedIDs()
				if len(resolvedIDs) != 1 {
					return false
				}
				if resolvedIDs[0] == publisherID {
					return true
				}
				return false
			}, time.Second*3), ShouldBeTrue)
		})
}
