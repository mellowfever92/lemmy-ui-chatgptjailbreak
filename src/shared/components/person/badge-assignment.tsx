import { Component, linkEvent } from "inferno";
import { HttpService } from "../../services";
import type { Badge } from "@utils/types";
import { toast } from "@utils/app";
import { I18NextService } from "../../services";
import { PersonId } from "lemmy-js-client";

interface BadgeAssignmentProps {
  personId: PersonId;
  personName: string;
  onAssigned?: () => void;
}

interface BadgeAssignmentState {
  badges: Badge[];
  loading: boolean;
  showModal: boolean;
  assigning: boolean;
}

export class BadgeAssignment extends Component<
  BadgeAssignmentProps,
  BadgeAssignmentState
> {
  state: BadgeAssignmentState = {
    badges: [],
    loading: false,
    showModal: false,
    assigning: false,
  };

  async componentDidMount() {
    await this.loadBadges();
  }

  loadBadges = async () => {
    this.setState({ loading: true });
    const res = await HttpService.listBadges();

    if (res.state === "success") {
      this.setState({ badges: res.data.badges, loading: false });
    } else {
      toast(I18NextService.i18n.t("failed_to_load_badges"), "danger");
      this.setState({ loading: false });
    }
  };

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  handleAssignBadge = async (badgeId: number) => {
    this.setState({ assigning: true });

    const res = await HttpService.assignBadge(
      this.props.personId,
      badgeId,
    );

    if (res.state === "success") {
      toast(
        I18NextService.i18n.t("badge_assigned_successfully"),
        "success",
      );
      this.setState({ showModal: false, assigning: false });
      this.props.onAssigned?.();
    } else {
      toast(I18NextService.i18n.t("failed_to_assign_badge"), "danger");
      this.setState({ assigning: false });
    }
  };

  render() {
    return (
      <>
        <button
          className="btn btn-secondary me-2"
          onClick={this.toggleModal}
          disabled={this.state.loading}
        >
          {I18NextService.i18n.t("assign_badge")}
        </button>

        {this.state.showModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={this.toggleModal}
          >
            <div
              className="modal-dialog"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {I18NextService.i18n.t("assign_badge_to", {
                      name: this.props.personName,
                    })}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={this.toggleModal}
                  />
                </div>
                <div className="modal-body">
                  {this.state.badges.length === 0 ? (
                    <p className="text-muted">
                      {I18NextService.i18n.t("no_badges_available")}
                    </p>
                  ) : (
                    <div className="list-group">
                      {this.state.badges.map(badge => (
                        <button
                          key={badge.id}
                          className="list-group-item list-group-item-action d-flex align-items-center"
                          onClick={() => this.handleAssignBadge(badge.id)}
                          disabled={this.state.assigning}
                        >
                          <img
                            src={badge.image_url}
                            alt={badge.name}
                            width={30}
                            height={30}
                            style={{
                              objectFit: "contain",
                              marginRight: "10px",
                            }}
                          />
                          <div>
                            <strong>{badge.name}</strong>
                            {badge.description && (
                              <p className="mb-0 small text-muted">
                                {badge.description}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={this.toggleModal}
                  >
                    {I18NextService.i18n.t("cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
